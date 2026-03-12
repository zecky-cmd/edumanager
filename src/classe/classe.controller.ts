import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClasseService } from './classe.service';
import { CreateClasseDto } from './dto/create-classe.dto';
import { UpdateClasseDto } from './dto/update-classe.dto';

@ApiTags('Classes')
@Controller('classe')
export class ClasseController {
  constructor(private readonly classeService: ClasseService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle classe' })
  create(@Body() createClasseDto: CreateClasseDto) {
    return this.classeService.create(createClasseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les classes' })
  @ApiQuery({ name: 'anneeId', required: false, description: 'Filtrer par année scolaire' })
  findAll(@Query('anneeId') anneeId?: string) {
    return this.classeService.findAll(anneeId ? +anneeId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une classe par son ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une classe' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClasseDto: UpdateClasseDto) {
    return this.classeService.update(id, updateClasseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une classe' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classeService.remove(id);
  }
}
