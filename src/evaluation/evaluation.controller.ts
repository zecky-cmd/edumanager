import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { CreateEvalWithNotesDto } from './dto/create-eval-with-notes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleUser } from '../users/entities/user.entity';

@ApiTags('Évaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ summary: 'Créer une nouvelle évaluation' })
  @ApiResponse({ status: 201, description: 'L\'évaluation a été créée avec succès' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  create(@Body() dto: CreateEvaluationDto) {
    return this.evaluationService.create(dto);
  }

  @Post('saisie-collective')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ summary: 'Créer une évaluation et saisir les notes de la classe' })
  @ApiResponse({ status: 201, description: 'L\'évaluation et les notes ont été créées avec succès' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  createWithNotes(@Body() dto: CreateEvalWithNotesDto) {
    return this.evaluationService.createWithNotes(dto);
  }

  @Get()
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ summary: 'Récupérer toutes les évaluations' })
  @ApiQuery({ name: 'matiereNiveauId', required: false, description: 'Filtrer par affectation' })
  @ApiQuery({ name: 'periodeId', required: false, description: 'Filtrer par période' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findAll(
    @Query('matiereNiveauId') matiereNiveauId?: string,
    @Query('periodeId') periodeId?: string,
  ) {
    return this.evaluationService.findAll(
      matiereNiveauId ? +matiereNiveauId : undefined,
      periodeId ? +periodeId : undefined,
    );
  }

  @Get(':id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ summary: 'Récupérer une évaluation par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'évaluation' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.evaluationService.findOne(id);
  }

  @Delete(':id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ summary: 'Supprimer une évaluation' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.evaluationService.remove(id);
  }
}
