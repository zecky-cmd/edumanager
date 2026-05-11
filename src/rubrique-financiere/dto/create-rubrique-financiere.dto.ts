import {
  IsNotEmpty,
  IsInt,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CycleMatiere } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTarifDto {
  @ApiProperty({ example: '6e' })
  @IsNotEmpty()
  @IsString()
  niveau: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  categorieId: number;

  @ApiProperty({ example: 75000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  montant: number;
}

export class CreateRubriqueFinanciereDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: "L'ID de l'année scolaire est requis" })
  @IsInt({ message: "L'ID doit être un nombre entier" })
  anneeId: number;

  @ApiProperty({ example: 'Scolarité T1' })
  @IsNotEmpty({ message: 'Le libellé est requis' })
  @IsString({ message: 'Le libellé doit être une chaîne de caractères' })
  @MaxLength(100)
  libelle: string;

  @ApiProperty({ enum: CycleMatiere, default: CycleMatiere.tous })
  @IsOptional()
  @IsEnum(CycleMatiere, { message: 'Cycle invalide (col, lyc, tous)' })
  cycle?: CycleMatiere;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean({ message: "L'obligation doit être un booléen" })
  estObligatoire?: boolean;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsInt({ message: "L'ordre doit être un nombre entier" })
  @Min(1)
  ordre?: number;

  @ApiProperty({ type: [CreateTarifDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTarifDto)
  tarifs?: CreateTarifDto[];
}
