import { IsNotEmpty, IsInt, IsString, MaxLength, IsEnum, IsDate, IsOptional, IsNumber, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TypeEvaluation } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class NoteSaisieDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  eleveId: number;

  @ApiProperty({ example: 15.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  valeur?: number;

  @ApiProperty({ example: false })
  @IsOptional()
  estAbsent?: boolean;

  @ApiProperty({ example: 'Bon travail' })
  @IsOptional()
  @IsString()
  appreciation?: string;
}

export class CreateEvalWithNotesDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  matiereNiveauId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  periodeId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  saisiParId: number;

  @ApiProperty({ example: 'Interrogation 1' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  titre: string;

  @ApiProperty({ enum: TypeEvaluation, example: TypeEvaluation.DS })
  @IsNotEmpty()
  @IsEnum(TypeEvaluation)
  type: TypeEvaluation;

  @ApiProperty({ example: '2024-10-15' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dateEvaluation: Date;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  coefficient?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  noteMax?: number;

  @ApiProperty({ type: [NoteSaisieDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteSaisieDto)
  notes: NoteSaisieDto[];
}
