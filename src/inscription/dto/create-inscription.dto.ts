import { IsNotEmpty, IsInt, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatutInscription } from '@prisma/client';

export class CreateInscriptionDto {
  @ApiProperty({
    description: 'ID de l\'année scolaire',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'année scolaire est requis' })
  @IsInt({ message: 'L\'ID de l\'année scolaire doit être un nombre entier' })
  anneeId: number;

  @ApiProperty({
    description: 'ID de l\'élève à inscrire',
    example: 2,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'élève est requis' })
  @IsInt({ message: 'L\'ID de l\'élève doit être un nombre entier' })
  eleveId: number;

  @ApiProperty({
    description: 'ID de la classe de destination',
    example: 3,
  })
  @IsNotEmpty({ message: 'L\'ID de la classe est requis' })
  @IsInt({ message: 'L\'ID de la classe doit être un nombre entier' })
  classeId: number;

  @ApiProperty({
    description: 'Statut de l\'inscription',
    enum: StatutInscription,
    default: StatutInscription.ins,
    required: false,
  })
  @IsOptional()
  @IsEnum(StatutInscription, { message: 'Le statut doit être "ins", "ab" ou "exc"' })
  statut?: StatutInscription;

  @ApiProperty({
    description: 'ID de la catégorie tarifaire de l\'élève',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'L\'ID de la catégorie doit être un nombre entier' })
  categorieTarifaireId?: number;
}
