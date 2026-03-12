import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModeEval } from '@prisma/client';

export class CreateAnneeScolaireDto {
  @ApiProperty({
    description: 'Libellé de l\'année scolaire',
    example: '2023-2024',
  })
  @IsNotEmpty({ message: 'Le libellé est requis' })
  @IsString({ message: 'Le libellé doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'Le libellé ne doit pas dépasser 20 caractères' })
  libelle: string;

  @ApiProperty({
    description: 'Date de début de l\'année scolaire',
    example: '2023-09-01T00:00:00Z',
  })
  @IsNotEmpty({ message: 'La date de début est requise' })
  @Type(() => Date)
  @IsDate({ message: 'La date de début doit être une date valide' })
  dateDebut: Date;

  @ApiProperty({
    description: 'Date de fin de l\'année scolaire',
    example: '2024-06-30T00:00:00Z',
  })
  @IsNotEmpty({ message: 'La date de fin est requise' })
  @Type(() => Date)
  @IsDate({ message: 'La date de fin doit être une date valide' })
  dateFin: Date;

  @ApiProperty({
    description: 'Mode d\'évaluation',
    enum: ModeEval,
    default: ModeEval.trim,
    required: false,
  })
  @IsOptional()
  @IsEnum(ModeEval, { message: 'Le mode d\'évaluation doit être "trim" ou "sem"' })
  modeEval?: ModeEval;
}
