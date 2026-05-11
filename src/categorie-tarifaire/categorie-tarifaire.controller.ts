import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategorieTarifaireService } from './categorie-tarifaire.service';
import { CreateCategorieTarifaireDto } from './dto/create-categorie-tarifaire.dto';
import { UpdateCategorieTarifaireDto } from './dto/update-categorie-tarifaire.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleUser } from '@prisma/client';

@ApiTags('Finance - Catégories Tarifaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categorie-tarifaire')
export class CategorieTarifaireController {
  constructor(private readonly service: CategorieTarifaireService) {}

  @Post()
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Créer une nouvelle catégorie tarifaire' })
  create(@Body() dto: CreateCategorieTarifaireDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les catégories tarifaires' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'une catégorie' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Modifier une catégorie' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategorieTarifaireDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Supprimer une catégorie (si non utilisée)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
