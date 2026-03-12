import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PeriodeService } from './periode.service';
import { CreatePeriodeDto } from './dto/create-periode.dto';
import { UpdatePeriodeDto } from './dto/update-periode.dto';

@ApiTags('Périodes Scolaires')
@Controller('periode')
export class PeriodeController {
  constructor(private readonly periodeService: PeriodeService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle période' })
  @ApiResponse({ status: 201, description: 'Période créée avec succès' })
  create(@Body() dto: CreatePeriodeDto) {
    return this.periodeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les périodes' })
  @ApiQuery({ name: 'anneeId', required: false, description: 'ID de l\'année scolaire (optionnel)' })
  findAll(@Query('anneeId') anneeId?: string) {
    return this.periodeService.findAll(anneeId ? +anneeId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une période par son ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une période' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePeriodeDto) {
    return this.periodeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une période' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.periodeService.remove(id);
  }
}
