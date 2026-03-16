import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateBulletinDto } from './dto/create-bulletin.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BulletinService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateBulletinDto) {
    const eleve = await this.databaseService.eleve.findUnique({ where: { id: dto.eleveId } });
    if (!eleve) throw new NotFoundException(`Élève ${dto.eleveId} non trouvé`);

    return this.databaseService.bulletin.create({
      data: dto as any,
      include: { eleve: { include: { user: true } }, periode: true },
    });
  }

  /**
   * Calcule la moyenne générale d'un élève pour une période donnée.
   * La moyenne est pondérée par les coefficients des matières.
   */
  async calculerResultats(eleveId: number, periodeId: number, valideParId: number) {
    // 1. Récupérer toutes les notes de l'élève pour cette période
    const notes = await this.databaseService.note.findMany({
      where: {
        eleveId,
        evaluation: { periodeId },
      },
      include: {
        evaluation: {
          include: {
            matiereNiveau: true,
          },
        },
      },
    });

    if (notes.length === 0) return null;

    // 2. Grouper les notes par MatiereNiveau
    const notesParMatiere: Record<number, any[]> = {};
    notes.forEach((n) => {
      const mnId = n.evaluation.matiereNiveauId;
      if (!notesParMatiere[mnId]) notesParMatiere[mnId] = [];
      notesParMatiere[mnId].push(n);
    });

    let sommeMoyennesCoeff = 0;
    let sommeCoeffsMatiere = 0;

    // 3. Pour chaque matière, calculer la moyenne
    for (const mnId in notesParMatiere) {
      const notesMatiere = notesParMatiere[mnId];
      const matiereNiveau = notesMatiere[0].evaluation.matiereNiveau;

      let sommePoints = 0;
      let sommeCoeffsEval = 0;

      notesMatiere.forEach((n) => {
        if (n.valeur !== null && !n.estAbsent) {
          const val = parseFloat(n.valeur.toString());
          const coeff = parseFloat(n.evaluation.coefficient.toString());
          sommePoints += val * coeff;
          sommeCoeffsEval += coeff;
        }
      });

      if (sommeCoeffsEval > 0) {
        const moyenneMatiere = sommePoints / sommeCoeffsEval;
        const coeffMatiere = parseFloat(matiereNiveau.coefficient.toString());
        sommeMoyennesCoeff += moyenneMatiere * coeffMatiere;
        sommeCoeffsMatiere += coeffMatiere;
      }
    }

    const moyenneGenerale = sommeCoeffsMatiere > 0 ? sommeMoyennesCoeff / sommeCoeffsMatiere : 0;

    // 4. Déterminer la mention
    let mention: any = 'aver';
    if (moyenneGenerale >= 16) mention = 'exc';
    else if (moyenneGenerale >= 14) mention = 'bien';
    else if (moyenneGenerale >= 10) mention = 'pass';

    // 5. Récupérer l'inscription pour avoir la classeId
    const inscription = await this.databaseService.inscription.findFirst({
      where: {
        eleveId,
        annee: { periodes: { some: { id: periodeId } } },
      },
    });

    if (!inscription) throw new NotFoundException(`Aucune inscription trouvée pour l'élève ${eleveId}`);

    // 6. Upsert du bulletin avec classeId
    return this.databaseService.bulletin.upsert({
      where: {
        eleveId_periodeId: { eleveId, periodeId },
      },
      update: {
        moyenneGenerale: new Decimal(moyenneGenerale.toFixed(2)),
        mention,
        valideParId,
        classeId: inscription.classeId,
      },
      create: {
        eleveId,
        periodeId,
        moyenneGenerale: new Decimal(moyenneGenerale.toFixed(2)),
        mention,
        valideParId,
        classeId: inscription.classeId,
      },
    });
  }

  /**
   * Atribue les rangs à tous les élèves d'une classe pour une période donnée.
   */
  async attribuerRangs(classeId: number, periodeId: number) {
    // 1. Récupérer tous les bulletins de la classe pour cette période
    const bulletins = await this.databaseService.bulletin.findMany({
      where: {
        periodeId,
        eleve: {
          inscriptions: {
            some: { classeId },
          },
        },
      },
      orderBy: { moyenneGenerale: 'desc' },
    });

    // 2. Assigner les rangs
    const updates = bulletins.map((b, index) => {
      return this.databaseService.bulletin.update({
        where: { id: b.id },
        data: { rang: index + 1 },
      });
    });

    await Promise.all(updates);
    return { count: updates.length };
  }

  async findByEleve(eleveId: number) {
    return this.databaseService.bulletin.findMany({
      where: { eleveId },
      include: { periode: true },
      orderBy: { periodeId: 'asc' },
    });
  }

  async findOne(id: number) {
    const bulletin = await this.databaseService.bulletin.findUnique({
      where: { id },
      include: { eleve: { include: { user: true } }, periode: true },
    });
    if (!bulletin) throw new NotFoundException(`Bulletin ${id} non trouvé`);
    return bulletin;
  }

  async publish(id: number) {
    return this.databaseService.bulletin.update({
      where: { id },
      data: { estPublie: true, datePublication: new Date() },
    });
  }

  async remove(id: number) {
    try {
      return await this.databaseService.bulletin.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException(`Bulletin ${id} non trouvé`);
      throw error;
    }
  }
}
