import { IsNotEmpty, IsEmail, IsString, MinLength, IsEnum, IsOptional, IsInt, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sexe } from '@prisma/client';
import { Type } from 'class-transformer';

export class InscriptionCompleteDto {
  // --- Données User ---
  @ApiProperty({ example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Koffi' })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: 'koffi.jean@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  // --- Données Eleve ---
  @ApiProperty({ enum: Sexe, example: Sexe.M })
  @IsEnum(Sexe)
  sexe: Sexe;

  @ApiProperty({ example: '2010-01-01', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateNaissance?: Date;

  @ApiProperty({ example: 'Abidjan', required: false })
  @IsOptional()
  @IsString()
  lieuNaissance?: string;

  @ApiProperty({ example: 'Ivoirienne', required: false })
  @IsOptional()
  @IsString()
  nationalite?: string;

  // --- Données Inscription ---
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  classeId: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsNotEmpty()
  anneeId: number;
}
