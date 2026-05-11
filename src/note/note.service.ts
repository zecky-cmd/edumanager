import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { RoleUser } from '../users/entities/user.entity';

@Injectable()
export class NoteService {
  constructor(private readonly databaseService: DatabaseService) {}

  async upsert(dto: CreateNoteDto, currentUser: any) {
    // 1. Vérification des droits pour les enseignants
    if (currentUser.role === RoleUser.ens) {
      const evaluation = await this.databaseService.evaluation.findUnique({
        where: { id: dto.evaluationId },
        include: { matiereNiveau: true }
      });
      
      if (!evaluation) throw new NotFoundException(`Évaluation ${dto.evaluationId} non trouvée`);
      
      const enseignant = await this.databaseService.enseignant.findUnique({
        where: { userId: currentUser.id }
      });

      if (!enseignant || evaluation.matiereNiveau.enseignantId !== enseignant.id) {
        throw new ForbiddenException("Vous n'êtes pas l'enseignant affecté à cette matière.");
      }
    }

    // Vérifier si l'évaluation existe (déjà fait au dessus pour ens, mais requis pour adm/dir)
    const evalObj = await this.databaseService.evaluation.findUnique({ where: { id: dto.evaluationId } });
    if (!evalObj) throw new NotFoundException(`Évaluation ${dto.evaluationId} non trouvée`);

    // Vérifier si l'élève existe
    const eleve = await this.databaseService.eleve.findUnique({ where: { id: dto.eleveId } });
    if (!eleve) throw new NotFoundException(`Élève ${dto.eleveId} non trouvé`);

    return this.databaseService.note.upsert({
      where: {
        eleveId_evaluationId: {
          eleveId: dto.eleveId,
          evaluationId: dto.evaluationId,
        },
      },
      update: {
        valeur: dto.valeur,
        estAbsent: dto.estAbsent,
        appreciation: dto.appreciation,
      },
      create: dto as any,
    });
  }

  async findByEvaluation(evaluationId: number, currentUser: any) {
    // Pour un enseignant, on vérifie qu'il a le droit de voir ces notes
    if (currentUser.role === RoleUser.ens) {
      const evaluation = await this.databaseService.evaluation.findUnique({
        where: { id: evaluationId },
        include: { matiereNiveau: true }
      });
      
      const enseignant = await this.databaseService.enseignant.findUnique({
        where: { userId: currentUser.id }
      });

      if (!evaluation || !enseignant || evaluation.matiereNiveau.enseignantId !== enseignant.id) {
        throw new ForbiddenException("Accès refusé aux notes de cette évaluation.");
      }
    }

    return this.databaseService.note.findMany({
      where: { evaluationId },
      include: { eleve: { include: { user: true } } },
    });
  }

  async findByEleve(eleveId: number, currentUser: any, periodeId?: number) {
    // Vérification pour les élèves : un élève ne voit que ses notes
    if (currentUser.role === RoleUser.elv) {
      const eleve = await this.databaseService.eleve.findUnique({ where: { userId: currentUser.id } });
      if (!eleve || eleve.id !== eleveId) {
        throw new ForbiddenException("Vous ne pouvez consulter que vos propres notes.");
      }
    }

    // Vérification pour les parents : un parent ne voit que les notes de ses enfants
    if (currentUser.role === RoleUser.par) {
      const parent = await this.databaseService.parent.findUnique({ 
        where: { userId: currentUser.id },
        include: { eleves: true }
      });
      const isChild = parent?.eleves.some(e => e.eleveId === eleveId);
      if (!isChild) {
        throw new ForbiddenException("Cet élève n'est pas rattaché à votre compte tuteur.");
      }
    }

    return this.databaseService.note.findMany({
      where: {
        eleveId,
        evaluation: periodeId ? { periodeId } : {},
      },
      include: {
        evaluation: {
          include: {
            matiereNiveau: { include: { matiere: true } },
            periode: true,
          },
        },
      },
    });
  }
}
