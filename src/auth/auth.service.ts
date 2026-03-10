import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, RoleUser } from '@prisma/client';
import { SanitizedUser } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DatabaseService } from '../database/database.service';

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    nom: string | null;
    prenom: string | null;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }
    let roleForCreate: 'adm' | 'dir' | 'ens' | 'par' | 'elv' | undefined =
      undefined;
    if (Object.values(RoleUser).includes(registerDto.role as any)) {
      roleForCreate = registerDto.role as any;
    }

    const user = await this.usersService.createUser({
      nom: registerDto.nom,
      prenom: registerDto.prenom,
      email: registerDto.email,
      password: registerDto.password,
      role: roleForCreate,
    });
    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const valid = await this.usersService.verifyPassword(
      loginDto.password,
      user.password,
    );
    if (!valid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Mettre à jour la date de dernière connexion
    await this.databaseService.user.update({
      where: { id: user.id },
      data: { derniereConnexion: new Date() },
    });

    return this.buildAuthResponse(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findByIdForAuth(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    const valid = await this.usersService.verifyPassword(
      dto.oldPassword,
      user.password,
    );
    if (!valid) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }
    await this.usersService.update(userId, { password: dto.newPassword });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // On ne révèle pas si l'email existe ou non
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.databaseService.passwordResetToken.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // À remplacer par un vrai envoi d'email
    // (pour le dev, le code sera visible dans les logs backend)

    console.log(`Code de réinitialisation pour ${dto.email} : ${code}`);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const now = new Date();
    const token = await this.databaseService.passwordResetToken.findFirst({
      where: {
        code: dto.code,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: true,
      },
    });

    if (!token || !token.user) {
      throw new NotFoundException(
        'Code de réinitialisation invalide ou expiré',
      );
    }

    await this.usersService.update(token.user.id, {
      password: dto.newPassword,
    });

    await this.databaseService.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: now },
    });
  }

  private buildAuthResponse(user: User | SanitizedUser): AuthResponse {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    };
  }
}
