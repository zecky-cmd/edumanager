import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnseignantService } from './enseignant.service';
import { CreateEnseignantDto } from './dto/create-enseignant.dto';
import { UpdateEnseignantDto } from './dto/update-enseignant.dto';

@ApiTags('Enseignants')
@Controller('enseignant')
export class EnseignantController {
  constructor(private readonly enseignantService: EnseignantService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un profil enseignant' })
  @ApiResponse({ status: 201, description: 'Enseignant créé avec succès' })
  create(@Body() dto: CreateEnseignantDto) {
    return this.enseignantService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les enseignants' })
  findAll() {
    return this.enseignantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un enseignant par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'enseignant' })
  @ApiResponse({ status: 404, description: 'Enseignant non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enseignantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un profil enseignant' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEnseignantDto) {
    return this.enseignantService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un profil enseignant' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enseignantService.remove(id);
  }
}
