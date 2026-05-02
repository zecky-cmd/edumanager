import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnseignantService } from './enseignant.service';
import { CreateEnseignantDto } from './dto/create-enseignant.dto';
import { UpdateEnseignantDto } from './dto/update-enseignant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleUser } from '../users/entities/user.entity';

@ApiTags('Enseignants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enseignant')
export class EnseignantController {
  constructor(private readonly enseignantService: EnseignantService) {}

  @Post()
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Créer un profil enseignant' })
  @ApiResponse({ status: 201, description: 'Enseignant créé avec succès' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  create(@Body() dto: CreateEnseignantDto) {
    return this.enseignantService.create(dto);
  }

  @Get()
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ summary: 'Récupérer tous les enseignants' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findAll() {
    return this.enseignantService.findAll();
  }

  @Get('stats/matieres')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ summary: 'Récupérer les statistiques par matière' })
  @ApiResponse({ status: 200, description: 'Statistiques calculées avec succès' })
  getStatsByMatiere() {
    return this.enseignantService.getStatsByMatiere();
  }

  @Get(':id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ summary: 'Récupérer un enseignant par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'enseignant' })
  @ApiResponse({ status: 404, description: 'Enseignant non trouvé' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enseignantService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Mettre à jour un profil enseignant' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEnseignantDto) {
    return this.enseignantService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Supprimer un profil enseignant' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enseignantService.remove(id);
  }
}
