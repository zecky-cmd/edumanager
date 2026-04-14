import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EleveService } from './eleve.service';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdateEleveDto } from './dto/update-eleve.dto';
import { InscriptionCompleteDto } from './dto/inscription-complete.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleUser } from '../users/entities/user.entity';

@ApiTags('Élèves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('eleve')
export class EleveController {
  constructor(private readonly eleveService: EleveService) {}

  @Post()
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Créer un profil élève' })
  @ApiResponse({ status: 201, description: 'L\'élève a été créé avec succès' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  create(@Body() dto: CreateEleveDto) {
    return this.eleveService.create(dto);
  }

  @Post('inscription-complete')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Inscription complète (User + Eleve + Inscription)' })
  @ApiResponse({ status: 201, description: 'L\'inscription complète a été réussie' })
  inscriptionComplete(@Body() dto: InscriptionCompleteDto) {
    return this.eleveService.inscriptionComplete(dto);
  }

  @Get()
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens, RoleUser.par)
  @ApiOperation({ summary: 'Récupérer tous les élèves' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findAll() {
    return this.eleveService.findAll();
  }

  @Get(':id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens, RoleUser.par)
  @ApiOperation({ summary: 'Récupérer un élève par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'élève' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eleveService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Mettre à jour un profil élève' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEleveDto) {
    return this.eleveService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Supprimer un profil élève' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eleveService.remove(id);
  }
}
