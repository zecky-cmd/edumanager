import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEnseignantDto } from './dto/create-enseignant.dto';
import { UpdateEnseignantDto } from './dto/update-enseignant.dto';

@Injectable()
export class EnseignantService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateEnseignantDto) {
    // Vérifier si l'utilisateur existe
    const user = await this.databaseService.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`L'utilisateur avec l'ID ${dto.userId} n'existe pas`);
    }

    // Vérifier si l'utilisateur est déjà un enseignant
    const existingEns = await this.databaseService.enseignant.findUnique({
      where: { userId: dto.userId },
    });
    if (existingEns) {
      throw new ConflictException(`Cet utilisateur est déjà enregistré comme enseignant`);
    }

    // Vérifier le matricule
    if (dto.matricule) {
      const existingMat = await this.databaseService.enseignant.findUnique({
        where: { matricule: dto.matricule },
      });
      if (existingMat) {
        throw new ConflictException(`Le matricule ${dto.matricule} est déjà utilisé`);
      }
    }

    return this.databaseService.enseignant.create({
      data: dto,
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll() {
    const enseignants = await this.databaseService.enseignant.findMany({
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
        classesPrincipales: {
          select: { id: true, nom: true },
        },
        matieresNiveau: {
          include: {
            matiere: { select: { id: true, nom: true } },
            classe: { select: { id: true, nom: true } },
            creneaux: { select: { heureDebut: true, heureFin: true } },
          },
        },
      },
      orderBy: {
        user: {
          nom: 'asc',
        },
      },
    });

    return enseignants.map((ens) => {
      const matieresMap = new Map();
      const classesMap = new Map();
      let totalMinutes = 0;

      ens.matieresNiveau.forEach((mn) => {
        matieresMap.set(mn.matiere.id, mn.matiere.nom);
        classesMap.set(mn.classe.id, mn.classe.nom);

        mn.creneaux.forEach((creneau) => {
          const debut = new Date(creneau.heureDebut);
          const fin = new Date(creneau.heureFin);
          const diffMs = fin.getTime() - debut.getTime();
          if (diffMs > 0) {
            totalMinutes += diffMs / (1000 * 60);
          }
        });
      });

      return {
        id: ens.id,
        userId: ens.userId,
        matricule: ens.matricule,
        specialite: ens.specialite,
        telephone: ens.telephone,
        statut: ens.statut,
        typeContrat: ens.typeContrat,
        user: ens.user,
        matieres: Array.from(matieresMap.values()),
        classes: {
          count: classesMap.size,
          noms: Array.from(classesMap.values()),
        },
        heuresSemaine: Math.round((totalMinutes / 60) * 10) / 10,
        classesPrincipales: ens.classesPrincipales.map((c) => c.nom),
      };
    });
  }

  async findOne(id: number) {
    const enseignant = await this.databaseService.enseignant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            role: true,
            estActif: true,
          },
        },
        matieresNiveau: {
          include: {
            matiere: true,
            classe: true,
          },
        },
        classesPrincipales: true,
      },
    });
    if (!enseignant) {
      throw new NotFoundException(`L'enseignant avec l'ID ${id} n'a pas été trouvé`);
    }
    return enseignant;
  }

  async update(id: number, dto: UpdateEnseignantDto) {
    try {
      if (dto.matricule) {
        const existing = await this.databaseService.enseignant.findUnique({
          where: { matricule: dto.matricule },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(`Le matricule ${dto.matricule} est déjà utilisé`);
        }
      }

      return await this.databaseService.enseignant.update({
        where: { id },
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
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`L'enseignant avec l'ID ${id} n'a pas été trouvé pour la mise à jour`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.databaseService.enseignant.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`L'enseignant avec l'ID ${id} n'a pas été trouvé pour la suppression`);
      }
      throw error;
    }
  }
  async getStatsByMatiere() {
    const matieresNiveaux = await this.databaseService.matiereNiveau.findMany({
      include: {
        matiere: { select: { id: true, nom: true } },
        classe: { select: { id: true } },
        enseignant: {
          include: {
            user: { select: { nom: true, prenom: true } },
          },
        },
        creneaux: { select: { heureDebut: true, heureFin: true } },
      },
    });

    const statsMap = new Map();

    matieresNiveaux.forEach((mn) => {
      const matId = mn.matiere.id;
      if (!statsMap.has(matId)) {
        statsMap.set(matId, {
          matiereId: matId,
          nomMatiere: mn.matiere.nom,
          classesSet: new Set(),
          enseignantsMap: new Map(),
          totalMinutes: 0,
        });
      }

      const stat = statsMap.get(matId);
      
      stat.classesSet.add(mn.classe.id);

      if (mn.enseignant && mn.enseignant.user) {
        const nom = mn.enseignant.user.nom || '';
        const prenom = mn.enseignant.user.prenom || '';
        const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
        
        stat.enseignantsMap.set(mn.enseignant.id, {
          id: mn.enseignant.id,
          nom,
          prenom,
          initiales,
        });
      }

      mn.creneaux.forEach((creneau) => {
        const debut = new Date(creneau.heureDebut);
        const fin = new Date(creneau.heureFin);
        const diffMs = fin.getTime() - debut.getTime();
        if (diffMs > 0) {
          stat.totalMinutes += diffMs / (1000 * 60);
        }
      });
    });

    const result = Array.from(statsMap.values()).map((stat) => ({
      matiereId: stat.matiereId,
      nomMatiere: stat.nomMatiere,
      nombreClasses: stat.classesSet.size,
      nombreEnseignants: stat.enseignantsMap.size,
      totalHeuresSemaine: Math.round((stat.totalMinutes / 60) * 10) / 10,
      enseignants: Array.from(stat.enseignantsMap.values()),
    }));

    return result.sort((a, b) => a.nomMatiere.localeCompare(b.nomMatiere));
  }
}
