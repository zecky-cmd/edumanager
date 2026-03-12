import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnneeScolaireService } from './annee-scolaire.service';
import { CreateAnneeScolaireDto } from './dto/create-annee-scolaire.dto';
import { UpdateAnneeScolaireDto } from './dto/update-annee-scolaire.dto';

@ApiTags('Années Scolaires')
@Controller('annee-scolaire')
export class AnneeScolaireController {
  constructor(private readonly anneeScolaireService: AnneeScolaireService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle année scolaire' })
  @ApiResponse({ status: 201, description: 'L\'année scolaire a été créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createAnneeScolaireDto: CreateAnneeScolaireDto) {
    return this.anneeScolaireService.create(createAnneeScolaireDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les années scolaires' })
  findAll() {
    return this.anneeScolaireService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une année scolaire par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'année scolaire' })
  @ApiResponse({ status: 404, description: 'Année scolaire non trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.anneeScolaireService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une année scolaire' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAnneeScolaireDto: UpdateAnneeScolaireDto) {
    return this.anneeScolaireService.update(id, updateAnneeScolaireDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une année scolaire' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.anneeScolaireService.remove(id);
  }
}
