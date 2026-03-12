import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EtablissementConfigService } from './etablissement_config.service';
import { CreateEtablissementConfigDto } from './dto/create-etablissement_config.dto';
import { UpdateEtablissementConfigDto } from './dto/update-etablissement_config.dto';

@ApiTags('Configuration Établissement')
@Controller('etablissement-config')
export class EtablissementConfigController {
  constructor(private readonly configService: EtablissementConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer la configuration de l\'établissement' })
  @ApiResponse({ status: 200, description: 'Configuration actuelle' })
  getConfig() {
    return this.configService.getConfig();
  }

  @Post()
  @ApiOperation({ summary: 'Créer ou mettre à jour la configuration complète' })
  @ApiResponse({ status: 200, description: 'Configuration enregistrée' })
  createOrUpdate(@Body() dto: CreateEtablissementConfigDto) {
    return this.configService.createOrUpdate(dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Mise à jour partielle de la configuration' })
  update(@Body() dto: UpdateEtablissementConfigDto) {
    return this.configService.createOrUpdate(dto);
  }

  @Put('annee-active/:id')
  @ApiOperation({ summary: 'Définir l\'année scolaire active par défaut' })
  @ApiResponse({ status: 200, description: 'Année active mise à jour' })
  setAnneeActive(@Param('id', ParseIntPipe) id: number) {
    return this.configService.setAnneeActive(id);
  }
}
