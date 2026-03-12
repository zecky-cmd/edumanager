import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEmail, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEtablissementConfigDto {
  @ApiProperty({
    description: 'ID de l\'année scolaire active par défaut',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'L\'ID de l\'année active doit être un nombre entier' })
  anneeActiveId?: number;

  @ApiProperty({
    description: 'Nom officiel de l\'établissement',
    example: 'Lycée Excellence',
  })
  @IsNotEmpty({ message: 'Le nom de l\'établissement est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MaxLength(150, { message: 'Le nom ne doit pas dépasser 150 caractères' })
  nom: string;

  @ApiProperty({
    description: 'Adresse physique de l\'établissement',
    example: '123 Avenue des Écoles',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  adresse?: string;

  @ApiProperty({
    description: 'Numéro de téléphone de contact',
    example: '+225 01020304',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'Le téléphone ne doit pas dépasser 20 caractères' })
  telephone?: string;

  @ApiProperty({
    description: 'Email de contact officiel',
    example: 'contact@lycee.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'L\'email doit être une adresse valide' })
  @MaxLength(100, { message: 'L\'email ne doit pas dépasser 100 caractères' })
  email?: string;

  @ApiProperty({
    description: 'URL du logo de l\'établissement',
    example: 'https://school.com/logo.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'L\'URL du logo doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'L\'URL du logo ne doit pas dépasser 255 caractères' })
  logoUrl?: string;

  @ApiProperty({
    description: 'Symbole de la devise utilisée (ex: F, €, $)',
    example: 'F',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La devise doit être une chaîne de caractères' })
  @MaxLength(10, { message: 'La devise ne doit pas dépasser 10 caractères' })
  devise?: string;
}
