import { IsNotEmpty, IsString, MaxLength, IsInt, IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StatutPeriode } from '@prisma/client';

export class CreatePeriodeDto {
  @ApiProperty({
    description: 'ID de l\'année scolaire associée',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'année scolaire est requis' })
  @IsInt({ message: 'L\'ID de l\'année scolaire doit être un nombre entier' })
  anneeId: number;

  @ApiProperty({
    description: 'Numéro de la période (ex: 1 pour Trimestre 1)',
    example: 1,
  })
  @IsNotEmpty({ message: 'Le numéro de la période est requis' })
  @IsInt({ message: 'Le numéro doit être un nombre entier' })
  numero: number;

  @ApiProperty({
    description: 'Nom de la période',
    example: 'Trimestre 1',
  })
  @IsNotEmpty({ message: 'Le libellé est requis' })
  @IsString({ message: 'Le libellé doit être une chaîne de caractères' })
  @MaxLength(30, { message: 'Le libellé ne doit pas dépasser 30 caractères' })
  libelle: string;

  @ApiProperty({
    description: 'Date de début de la période',
    example: '2023-09-01T00:00:00Z',
  })
  @IsNotEmpty({ message: 'La date de début est requise' })
  @Type(() => Date)
  @IsDate({ message: 'La date de début doit être une date valide' })
  dateDebut: Date;

  @ApiProperty({
    description: 'Date de fin de la période',
    example: '2023-12-20T00:00:00Z',
  })
  @IsNotEmpty({ message: 'La date de fin est requise' })
  @Type(() => Date)
  @IsDate({ message: 'La date de fin doit être une date valide' })
  dateFin: Date;

  @ApiProperty({
    description: 'Statut de la période',
    enum: StatutPeriode,
    default: StatutPeriode.ouv,
    required: false,
  })
  @IsOptional()
  @IsEnum(StatutPeriode, { message: 'Le statut doit être "ouv", "clos" ou "arch"' })
  statut?: StatutPeriode;
}
