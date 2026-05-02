import { IsNotEmpty, IsInt, IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatutEnseignant, TypeContrat } from '@prisma/client';

export class CreateEnseignantDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur associé au profil enseignant',
    example: 2,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'utilisateur est requis' })
  @IsInt({ message: 'L\'ID de l\'utilisateur doit être un nombre entier' })
  userId: number;

  @ApiProperty({
    description: 'Matricule unique de l\'enseignant',
    example: 'ENS2023001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le matricule doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'Le matricule ne doit pas dépasser 20 caractères' })
  matricule?: string;

  @ApiProperty({
    description: 'Domaine de spécialité (ex: Mathématiques)',
    example: 'Mathématiques',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La spécialité doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La spécialité ne doit pas dépasser 100 caractères' })
  specialite?: string;

  @ApiProperty({
    description: 'Numéro de téléphone professionnel',
    example: '+225 01020304',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'Le téléphone ne doit pas dépasser 20 caractères' })
  telephone?: string;

  @ApiProperty({
    description: 'Statut actuel de l\'enseignant',
    enum: StatutEnseignant,
    default: StatutEnseignant.actif,
    required: false,
  })
  @IsOptional()
  @IsEnum(StatutEnseignant, { message: 'Le statut doit être "actif" ou "inact"' })
  statut?: StatutEnseignant;

  @ApiProperty({
    description: 'Type de contrat de l\'enseignant',
    enum: TypeContrat,
    default: TypeContrat.permanent,
    required: false,
  })
  @IsOptional()
  @IsEnum(TypeContrat, { message: 'Le type de contrat doit être "permanent" ou "vacataire"' })
  typeContrat?: TypeContrat;
}
