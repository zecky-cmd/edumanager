import { IsNotEmpty, IsInt, IsNumber, Min, Max, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'ID de l\'élève',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'élève est requis' })
  @IsInt()
  eleveId: number;

  @ApiProperty({
    description: 'ID de l\'évaluation',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'évaluation est requis' })
  @IsInt()
  evaluationId: number;

  @ApiProperty({
    description: 'Valeur de la note',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  valeur?: number;

  @ApiProperty({
    description: 'Est absent',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  estAbsent?: boolean;

  @ApiProperty({
    description: 'Appréciation',
    example: 'Bon travail',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  appreciation?: string;
}
