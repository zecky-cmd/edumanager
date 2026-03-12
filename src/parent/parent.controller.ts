import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParentService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@ApiTags('Parents')
@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un profil parent' })
  @ApiResponse({ status: 201, description: 'Le parent a été créé avec succès' })
  create(@Body() dto: CreateParentDto) {
    return this.parentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les parents' })
  findAll() {
    return this.parentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un parent par son ID' })
  @ApiResponse({ status: 200, description: 'Détails du parent' })
  @ApiResponse({ status: 404, description: 'Parent non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un profil parent' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateParentDto) {
    return this.parentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un profil parent' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parentService.remove(id);
  }
}
