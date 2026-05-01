import { IsNotEmpty, IsInt, IsNumber, Min, Max, IsEnum, IsOptional, IsString, IsBoolean, IsUrl, MaxLength } from 'class-validator';
import { MentionBulletin } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBulletinDto {
  @ApiProperty({
    description: 'ID de l\'élève',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'élève est requis' })
  @IsInt()
  eleveId: number;

  @ApiProperty({
    description: 'ID de la période',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de la période est requis' })
  @IsInt()
  periodeId: number;

  @ApiProperty({
    description: 'ID de la personne qui a validé',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de la personne qui a validé est requis' })
  @IsInt()
  valideParId: number;

  @ApiProperty({
    description: 'Moyenne générale du bulletin',
    example: 14.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  moyenneGenerale?: number;

  @ApiProperty({
    description: 'Rang de l\'élève dans sa classe',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  rang?: number;

  @ApiProperty({
    description: 'Mention obtenue',
    enum: MentionBulletin,
    example: MentionBulletin.pass,
    required: false,
  })
  @IsEnum(MentionBulletin)
  mention?: MentionBulletin;

  @ApiProperty({
    description: 'Appréciation générale du bulletin',
    example: 'Félicitations ! Continuez vos efforts.',
    required: false,
  })
  @IsOptional()
  @IsString()
  appreciationGen?: string;

  @ApiProperty({
    description: 'Statut de publication du bulletin',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  estPublie?: boolean;

  @ApiProperty({
    description: 'URL du fichier PDF du bulletin',
    example: 'https://example.com/bulletin_eleve_1.pdf',
    required: false,
  })
  @ IsOptional()
  @IsUrl()
  @MaxLength(255)
  pdfUrl?: string;
}
