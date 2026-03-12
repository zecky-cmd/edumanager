import { IsNotEmpty, IsInt, IsOptional, IsString, MaxLength, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Sexe } from '@prisma/client';

export class CreateEleveDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur associé au profil élève',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'L\'ID de l\'utilisateur doit être un nombre entier' })
  userId?: number;

  @ApiProperty({
    description: 'Matricule unique de l\'élève',
    example: 'ELV20230001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le matricule doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'Le matricule ne doit pas dépasser 20 caractères' })
  matricule?: string;

  @ApiProperty({
    description: 'Date de naissance de l\'élève',
    example: '2010-05-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La date de naissance doit être une date valide' })
  dateNaissance?: Date;

  @ApiProperty({
    description: 'Lieu de naissance',
    example: 'Abidjan',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le lieu de naissance doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'Le lieu de naissance ne doit pas dépasser 100 caractères' })
  lieuNaissance?: string;

  @ApiProperty({
    description: 'Sexe de l\'élève',
    enum: Sexe,
    example: Sexe.M,
  })
  @IsNotEmpty({ message: 'Le sexe est requis' })
  @IsEnum(Sexe, { message: 'Le sexe doit être "M" ou "F"' })
  sexe: Sexe;

  @ApiProperty({
    description: 'Nationalité',
    example: 'Ivoirienne',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La nationalité doit être une chaîne de caractères' })
  @MaxLength(50, { message: 'La nationalité ne doit pas dépasser 50 caractères' })
  nationalite?: string;

  @ApiProperty({
    description: 'URL de la photo de profil',
    example: 'https://school.com/photos/elv1.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'L\'URL de la photo doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'L\'URL de la photo ne doit pas dépasser 255 caractères' })
  photoUrl?: string;
}
