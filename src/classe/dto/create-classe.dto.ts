import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Cycle } from '@prisma/client';

export class CreateClasseDto {
  @ApiProperty({
    description: 'ID de l\'année scolaire',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'année scolaire est requis' })
  @IsInt({ message: 'L\'ID de l\'année scolaire doit être un nombre entier' })
  anneeId: number;

  @ApiProperty({
    description: 'Nom de la classe',
    example: '6ème A',
  })
  @IsNotEmpty({ message: 'Le nom de la classe est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MaxLength(30, { message: 'Le nom ne doit pas dépasser 30 caractères' })
  nom: string;

  @ApiProperty({
    description: 'Cycle scolaire',
    enum: Cycle,
    example: Cycle.col,
  })
  @IsNotEmpty({ message: 'Le cycle est requis' })
  @IsEnum(Cycle, { message: 'Le cycle doit être "col" (collège) ou "lyc" (lycée)' })
  cycle: Cycle;

  @ApiProperty({
    description: 'Niveau d\'étude',
    example: '6eme',
  })
  @IsNotEmpty({ message: 'Le niveau est requis' })
  @IsString({ message: 'Le niveau doit être une chaîne de caractères' })
  @MaxLength(15, { message: 'Le niveau ne doit pas dépasser 15 caractères' })
  niveau: string;

  @ApiProperty({
    description: 'Série (ex: S, L, C, etc.)',
    example: 'S',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La série doit être une chaîne de caractères' })
  @MaxLength(5, { message: 'La série ne doit pas dépasser 5 caractères' })
  serie?: string;

  @ApiProperty({
    description: 'Nom ou numéro de la salle',
    example: 'Salle 101',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La salle doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'La salle ne doit pas dépasser 20 caractères' })
  salle?: string;

  @ApiProperty({
    description: 'Capacité maximale d\'élèves',
    example: 40,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'La capacité maximale doit être un nombre entier' })
  @Min(1, { message: 'La capacité maximale doit être d\'au moins 1' })
  capaciteMax?: number;
}
