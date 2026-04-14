import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { CreateEvalWithNotesDto } from './dto/create-eval-with-notes.dto';

@Injectable()
export class EvaluationService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateEvaluationDto) {
    return this.databaseService.evaluation.create({
      data: dto as any,
      include: {
        matiereNiveau: {
          include: { matiere: true, classe: true }
        },
        periode: true,
      },
    });
  }

  async createWithNotes(dto: CreateEvalWithNotesDto) {
    const { notes, ...evalData } = dto;

    const evaluation = await this.databaseService.$transaction(async (tx) => {
      // 1. Créer l'évaluation
      const createdEval = await tx.evaluation.create({
        data: evalData,
      });

      // 2. Créer toutes les notes rattachées
      if (notes && notes.length > 0) {
        await tx.note.createMany({
          data: notes.map((n) => ({
            ...n,
            evaluationId: createdEval.id,
          })),
        });
      }

      return createdEval;
    });

    return this.findOne(evaluation.id);
  }

  async findAll(matiereNiveauId?: number, periodeId?: number) {
    return this.databaseService.evaluation.findMany({
      where: {
        AND: [
          matiereNiveauId ? { matiereNiveauId } : {},
          periodeId ? { periodeId } : {},
        ],
      },
      include: {
        matiereNiveau: { include: { matiere: true, classe: true } },
        periode: true,
      },
    });
  }

  async findOne(id: number) {
    const evaluation = await this.databaseService.evaluation.findUnique({
      where: { id },
      include: {
        matiereNiveau: { include: { matiere: true, classe: true } },
        periode: true,
        notes: { include: { eleve: { include: { user: true } } } },
      },
    });
    if (!evaluation) throw new NotFoundException(`Évaluation ${id} non trouvée`);
    return evaluation;
  }

  async remove(id: number) {
    try {
      return await this.databaseService.evaluation.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException(`Évaluation ${id} non trouvée`);
      throw error;
    }
  }
}
