import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CycleMatiere } from '@prisma/client';

export class CreateMatiereDto {
  @ApiProperty({
    description: 'Nom de la matière',
    example: 'Mathématiques',
  })
  @IsNotEmpty({ message: 'Le nom de la matière est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MaxLength(80, { message: 'Le nom ne doit pas dépasser 80 caractères' })
  nom: string;

  @ApiProperty({
    description: 'Code de la matière',
    example: 'MATH01',
  })
  @IsNotEmpty({ message: 'Le code de la matière est requis' })
  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  @MaxLength(10, { message: 'Le code ne doit pas dépasser 10 caractères' })
  code: string;

  @ApiProperty({
    description: 'Cycle(s) concerné(s) par la matière',
    enum: CycleMatiere,
    default: CycleMatiere.tous,
    required: false,
  })
  @IsOptional()
  @IsEnum(CycleMatiere, { message: 'Le cycle doit être "col", "lyc" ou "tous"' })
  cycle?: CycleMatiere;

  @ApiProperty({
    description: 'Couleur associée à la matière (code hexadécimal)',
    example: '#FF0000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La couleur doit être une chaîne de caractères' })
  @MaxLength(7, { message: 'La couleur ne doit pas dépasser 7 caractères' })
  @IsHexColor({ message: 'La couleur doit être un code hexadécimal valide' })
  couleur?: string;
}
