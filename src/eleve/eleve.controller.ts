import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EleveService } from './eleve.service';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdateEleveDto } from './dto/update-eleve.dto';

@ApiTags('Élèves')
@Controller('eleve')
export class EleveController {
  constructor(private readonly eleveService: EleveService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un profil élève' })
  @ApiResponse({ status: 201, description: 'L\'élève a été créé avec succès' })
  create(@Body() dto: CreateEleveDto) {
    return this.eleveService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les élèves' })
  findAll() {
    return this.eleveService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un élève par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'élève' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eleveService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un profil élève' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEleveDto) {
    return this.eleveService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un profil élève' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eleveService.remove(id);
  }
}
