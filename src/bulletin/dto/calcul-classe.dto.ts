import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculClasseDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  classeId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  periodeId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  valideParId: number;
}
