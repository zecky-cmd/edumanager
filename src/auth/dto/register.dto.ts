import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleUser } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    description: 'Nom de l\'utilisateur',
    example: 'Koffi',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MaxLength(80, { message: 'Le nom doit contenir au plus 80 caractères' })
  nom?: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'Jean',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @MaxLength(80, { message: 'Le prénom doit contenir au plus 80 caractères' })
  prenom?: string;

  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'jean.koffi@example.com',
  })
  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "L'email doit être une adresse email valide" })
  email: string;

  @ApiProperty({
    description: 'Mot de passe (8-50 caractères)',
    example: 'Password123!',
    minLength: 8,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(50, {
    message: 'Le mot de passe doit contenir au plus 50 caractères',
  })
  password: string;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    enum: RoleUser,
    default: RoleUser.elv,
    required: false,
  })
  @IsOptional()
  @IsEnum(RoleUser, {
    message: 'Le rôle doit être un des rôles valides(adm, dir, ens, par, elv)',
  })
  role?: (typeof RoleUser)[keyof typeof RoleUser];
}
