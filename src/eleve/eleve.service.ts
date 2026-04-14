import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { CreateEleveDto } from './dto/create-eleve.dto';
import { UpdateEleveDto } from './dto/update-eleve.dto';
import { InscriptionCompleteDto } from './dto/inscription-complete.dto';
import { RoleUser } from '@prisma/client';

@Injectable()
export class EleveService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateEleveDto) {
    if (dto.userId) {
      const user = await this.databaseService.user.findUnique({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException(`L'utilisateur avec l'ID ${dto.userId} n'existe pas`);
      }

      const existingEleve = await this.databaseService.eleve.findUnique({
        where: { userId: dto.userId },
      });
      if (existingEleve) {
        throw new ConflictException(`Cet utilisateur est déjà enregistré comme élève`);
      }
    }

    if (dto.matricule) {
      const existingMat = await this.databaseService.eleve.findUnique({
        where: { matricule: dto.matricule },
      });
      if (existingMat) {
        throw new ConflictException(`Le matricule ${dto.matricule} est déjà utilisé`);
      }
    }

    return this.databaseService.eleve.create({
      data: dto,
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });
  }

  async inscriptionComplete(dto: InscriptionCompleteDto) {
    // 1. Vérifier si l'email existe déjà
    const existingUser = await this.databaseService.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException(`L'email ${dto.email} est déjà utilisé`);
    }

    // 2. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Transaction atomique
    return this.databaseService.$transaction(async (tx) => {
      // Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: RoleUser.elv,
          nom: dto.nom,
          prenom: dto.prenom,
        },
      });

      // Créer le profil élève
      const eleve = await tx.eleve.create({
        data: {
          userId: user.id,
          sexe: dto.sexe,
          dateNaissance: dto.dateNaissance,
          lieuNaissance: dto.lieuNaissance,
          nationalite: dto.nationalite,
          matricule: `ELV${Date.now()}${Math.floor(Math.random() * 1000)}`,
        },
      });

      // Créer l'inscription
      await tx.inscription.create({
        data: {
          eleveId: eleve.id,
          classeId: dto.classeId,
          anneeId: dto.anneeId,
        },
      });

      return {
        message: 'Inscription complète réussie',
        eleveId: eleve.id,
        userId: user.id,
        email: user.email,
      };
    });
  }

  async findAll() {
    return this.databaseService.eleve.findMany({
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
          },
        },
        inscriptions: {
          include: {
            classe: true,
          },
        },
      },
      orderBy: {
        user: {
          nom: 'asc',
        },
      },
    });
  }

  async findOne(id: number) {
    const eleve = await this.databaseService.eleve.findUnique({
      where: { id },
      include: {
        user: true,
        inscriptions: {
          include: {
            classe: {
              include: {
                annee: true,
              },
            },
          },
        },
        parents: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    if (!eleve) {
      throw new NotFoundException(`L'élève avec l'ID ${id} n'a pas été trouvé`);
    }
    return eleve;
  }

  async update(id: number, dto: UpdateEleveDto) {
    try {
      if (dto.matricule) {
        const existing = await this.databaseService.eleve.findUnique({
          where: { matricule: dto.matricule },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(`Le matricule ${dto.matricule} est déjà utilisé`);
        }
      }

      return await this.databaseService.eleve.update({
        where: { id },
        data: dto,
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`L'élève avec l'ID ${id} n'a pas été trouvé pour la mise à jour`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.databaseService.eleve.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`L'élève avec l'ID ${id} n'a pas été trouvé pour la suppression`);
      }
      throw error;
    }
  }
}
