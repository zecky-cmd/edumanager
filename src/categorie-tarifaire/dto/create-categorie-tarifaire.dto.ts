import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategorieTarifaireDto {
  @ApiProperty({ example: 'Affecté', description: 'Nom de la catégorie' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(50)
  nom: string;

  @ApiProperty({ example: 'Élèves affectés par l\'État', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
