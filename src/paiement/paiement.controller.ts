import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaiementService } from './paiement.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleUser } from '../users/entities/user.entity';

@ApiTags('Paiements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('paiement')
export class PaiementController {
  constructor(private readonly paiementService: PaiementService) {}

  @Post()
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Enregistrer un nouveau paiement' })
  @ApiResponse({ status: 201, description: 'Paiement enregistré avec succès' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  create(@Body() dto: CreatePaiementDto) {
    return this.paiementService.create(dto);
  }

  @Get()
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.par)
  @ApiOperation({ summary: 'Récupérer l\'historique des paiements' })
  @ApiQuery({ name: 'eleveId', required: false, description: 'Filtrer par élève' })
  @ApiResponse({ status: 200, description: 'Liste des paiements' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findAll(@Query('eleveId') eleveId?: string) {
    return this.paiementService.findAll(eleveId ? +eleveId : undefined);
  }

  @Get(':id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.par)
  @ApiOperation({ summary: 'Récupérer un paiement par son ID' })
  @ApiResponse({ status: 200, description: 'Détails du paiement' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paiementService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Modifier un paiement' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaiementDto) {
    return this.paiementService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Supprimer un paiement' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paiementService.remove(id);
  }

  @Get('situation/:eleveId')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.par)
  @ApiOperation({ summary: 'Récupérer la situation financière d\'un élève' })
  @ApiQuery({ name: 'anneeId', required: false, description: 'ID de l\'année scolaire (optionnel)' })
  async getSituation(
    @Param('eleveId', ParseIntPipe) eleveId: number,
    @Query('anneeId') anneeId?: string,
  ) {
    return this.paiementService.getSituationFinanciere(eleveId, anneeId ? +anneeId : undefined);
  }
}
