import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BulletinService } from './bulletin.service';
import { CreateBulletinDto } from './dto/create-bulletin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleUser } from '../users/entities/user.entity';

@ApiTags('Bulletins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bulletin')
export class BulletinController {
  constructor(private readonly bulletinService: BulletinService) {}

  @Post()
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Générer un bulletin scolaire (Manuel)' })
  @ApiResponse({ status: 201, description: 'Le bulletin a été généré avec succès' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  create(@Body() dto: CreateBulletinDto) {
    return this.bulletinService.create(dto);
  }

  @Post('generate-eleve/:eleveId/:periodeId')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Calculer la moyenne d\'un élève' })
  async generateForEleve(
    @Param('eleveId', ParseIntPipe) eleveId: number,
    @Param('periodeId', ParseIntPipe) periodeId: number,
    @Body('userId', ParseIntPipe) userId: number, // ID de l'admin qui valide
  ) {
    return this.bulletinService.calculerResultats(eleveId, periodeId, userId);
  }

  @Post('rank-classe/:classeId/:periodeId')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Calculer les rangs d\'une classe' })
  async rankClasse(
    @Param('classeId', ParseIntPipe) classeId: number,
    @Param('periodeId', ParseIntPipe) periodeId: number,
  ) {
    return this.bulletinService.attribuerRangs(classeId, periodeId);
  }

  @Get('eleve/:id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.par, RoleUser.elv)
  @ApiOperation({ summary: 'Récupérer les bulletins d\'un élève' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findByEleve(@Param('id', ParseIntPipe) id: number) {
    return this.bulletinService.findByEleve(id);
  }

  @Get(':id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.par, RoleUser.elv)
  @ApiOperation({ summary: 'Récupérer un bulletin détaillé' })
  @ApiResponse({ status: 200, description: 'Détails du bulletin' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bulletinService.findOne(id);
  }

  @Patch(':id/publish')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Publier un bulletin (le rendre visible aux parents/élèves)' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.bulletinService.publish(id);
  }

  @Delete(':id')
  @Roles(RoleUser.adm, RoleUser.dir)
  @ApiOperation({ summary: 'Supprimer un bulletin' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bulletinService.remove(id);
  }
}
