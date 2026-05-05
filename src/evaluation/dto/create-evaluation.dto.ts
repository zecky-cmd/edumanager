import { IsNotEmpty, IsInt, IsString, MaxLength, IsEnum, IsDate, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TypeEvaluation } from '@prisma/client';

export class CreateEvaluationDto {
  @IsNotEmpty({ message: 'L\'ID de la matière au niveau est requis' })
  @IsInt({ message: 'L\'ID doit être un nombre entier' })
  matiereNiveauId: number;

  @IsNotEmpty({ message: 'L\'ID de la période est requis' })
  @IsInt({ message: 'L\'ID doit être un nombre entier' })
  periodeId: number;

  @IsNotEmpty({ message: 'L\'ID de l\'utilisateur (saisie) est requis' })
  @IsInt({ message: 'L\'ID doit être un nombre entier' })
  saisiParId: number;

  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @MaxLength(100)
  titre: string;

  @IsNotEmpty({ message: 'Le type est requis' })
  @IsEnum(TypeEvaluation, { message: 'Type invalide (DS, comp, interro, examen, TP)' })
  type: TypeEvaluation;

  @IsNotEmpty({ message: 'La date est requise' })
  @Type(() => Date)
  @IsDate()
  dateEvaluation: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  coefficient?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  noteMax?: number;
}
