import { IsNotEmpty, IsInt, IsEnum, IsString, MaxLength, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { JourCreneau } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCreneauDto {
  @ApiProperty({
    description: 'ID de la matière au niveau',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID de la matière au niveau est requis' })
  @IsInt()
  matiereNiveauId: number;

  @ApiProperty({
    description: 'Jour de la semaine',
    enum: JourCreneau,
    example: JourCreneau.lun,
  })
  @IsNotEmpty({ message: 'Le jour est requis' })
  @IsEnum(JourCreneau, { message: 'Jour invalide (lun, mar, mer, jeu, ven, sam)' })
  jour: JourCreneau;

  @ApiProperty({
    description: 'Heure de début du créneau',
    example: '2023-01-01T08:00:00.000Z',
  })
  @IsNotEmpty({ message: 'L\'heure de début est requise' })
  @Type(() => Date)
  @IsDate()
  heureDebut: Date;

  @ApiProperty({
    description: 'Heure de fin du créneau',
    example: '2023-01-01T09:00:00.000Z',
  })
  @IsNotEmpty({ message: 'L\'heure de fin est requise' })
  @Type(() => Date)
  @IsDate()
  heureFin: Date;

  @ApiProperty({
    description: 'Salle de classe',
    example: 'A101',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  salle?: string;
}
