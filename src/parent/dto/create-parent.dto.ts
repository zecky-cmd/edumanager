import { IsNotEmpty, IsInt, IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LienParent } from '@prisma/client';

export class CreateParentDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur associé au profil parent',
    example: 4,
  })
  @IsNotEmpty({ message: 'L\'ID de l\'utilisateur est requis' })
  @IsInt({ message: 'L\'ID de l\'utilisateur doit être un nombre entier' })
  userId: number;

  @ApiProperty({
    description: 'Numéro de téléphone de contact',
    example: '+225 07070707',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'Le téléphone ne doit pas dépasser 20 caractères' })
  telephone?: string;

  @ApiProperty({
    description: 'Lien de parenté avec l\'élève',
    enum: LienParent,
    example: LienParent.pere,
  })
  @IsNotEmpty({ message: 'Le lien de parenté est requis' })
  @IsEnum(LienParent, { message: 'Le lien doit être "pere", "mere" ou "tuteur"' })
  lien: LienParent;
}
