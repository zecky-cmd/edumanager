import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatiereService } from './matiere.service';
import { CreateMatiereDto } from './dto/create-matiere.dto';
import { UpdateMatiereDto } from './dto/update-matiere.dto';

@ApiTags('Matières')
@Controller('matiere')
export class MatiereController {
  constructor(private readonly matiereService: MatiereService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle matière' })
  @ApiResponse({ status: 201, description: 'Matière créée avec succès' })
  create(@Body() createMatiereDto: CreateMatiereDto) {
    return this.matiereService.create(createMatiereDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les matières' })
  findAll() {
    return this.matiereService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une matière par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de la matière' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matiereService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une matière' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMatiereDto: UpdateMatiereDto) {
    return this.matiereService.update(id, updateMatiereDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une matière' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matiereService.remove(id);
  }
}
