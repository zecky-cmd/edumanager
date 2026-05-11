import { Controller, Post, Body, UseGuards, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService, CopierTarifsDto } from './finance.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleUser } from '@prisma/client';

@ApiTags('Finance - Opérations Globales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Post('copier-tarifs')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Dupliquer une grille tarifaire vers une autre catégorie' })
  copierTarifs(@Body() dto: CopierTarifsDto) {
    return this.service.copierGrilleTarifaire(dto);
  }

  @Get('calcul-dette')
  @ApiOperation({ summary: 'Calculer le montant total dû par un élève' })
  calculerDette(
    @Query('eleveId', ParseIntPipe) eleveId: number,
    @Query('anneeId', ParseIntPipe) anneeId: number,
  ) {
    return this.service.calculerTotalDu(eleveId, anneeId);
  }
}
