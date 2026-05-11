import { PartialType } from '@nestjs/swagger';
import { CreateCategorieTarifaireDto } from './create-categorie-tarifaire.dto';

export class UpdateCategorieTarifaireDto extends PartialType(CreateCategorieTarifaireDto) {}
