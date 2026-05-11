import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { RoleUser } from '../entities/user.entity'; // Updated import to use RoleUser

export class CreateUserDto {
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MaxLength(80, { message: 'Le nom doit contenir au plus 80 caractères' })
  nom?: string;

  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @MaxLength(80, { message: 'Le prénom doit contenir au plus 80 caractères' })
  prenom?: string;

  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "L'email doit être une adresse email valide" })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(50, {
    message: 'Le mot de passe doit contenir au plus 50 caractères',
  })
  password: string;

  @IsOptional()
  @IsEnum(RoleUser, {
    message: 'Le rôle doit être un rôle valide (adm, dir, ens, par, elv)',
  })
  role?: (typeof RoleUser)[keyof typeof RoleUser];

  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit être un booléen' })
  estActif?: boolean;
}
