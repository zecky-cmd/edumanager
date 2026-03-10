import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, RoleUser, SanitizedUser } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) { }

  sanitizeUser(user: User): SanitizedUser {
    const { password, tokenReset, tokenExpiry, ...result } = user;
    return result;
  }

  async createUser(createUserDto: CreateUserDto): Promise<SanitizedUser> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS,
    );
    const user = await this.databaseService.user.create({
      data: {
        nom: createUserDto.nom,
        prenom: createUserDto.prenom,
        email: createUserDto.email,
        role: (createUserDto.role?.toLowerCase() as RoleUser) ?? RoleUser.elv,
        password: hashedPassword,
      },
    });
    return this.sanitizeUser(user);
  }

  async findAll(role?: string): Promise<SanitizedUser[]> {
    let users: User[];
    if (role) {
      users = await this.databaseService.user.findMany({
        where: { role: role.toLowerCase() as RoleUser },
      });
    } else {
      users = await this.databaseService.user.findMany();
    }
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: number): Promise<SanitizedUser | null> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return this.sanitizeUser(user);
  }

  async findByIdForAuth(id: number): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<SanitizedUser> {
    let hashedPassword: string | undefined = undefined;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, SALT_ROUNDS);
    }

    try {
      const user = await this.databaseService.user.update({
        where: { id },
        data: {
          ...updateUserDto,
          password: hashedPassword ?? undefined,
          role: updateUserDto.role
            ? (updateUserDto.role.toLowerCase() as RoleUser)
            : undefined,
        },
      });
      return this.sanitizeUser(user);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Utilisateur non trouvé pour la modification');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<SanitizedUser> {
    try {
      const user = await this.databaseService.user.delete({
        where: { id },
      });
      return this.sanitizeUser(user);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Utilisateur non trouvé pour la suppression');
      }
      throw error;
    }
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // async hashPassword(password: string): Promise<string> {
  //     return await bcrypt.hash(password, SALT_ROUNDS);
  // }

  // async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  //     return await bcrypt.compare(plainPassword, hashedPassword);
  // }
}
