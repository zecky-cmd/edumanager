import { MentionBulletin } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Typage strict pour éviter les soulignements
export interface NoteData {
  valeur: Decimal | null; // Autoriser null pour les notes non saisies
  estAbsent: boolean;
  evaluation: {
    coefficient: Decimal;
    matiereNiveauId: number;
    matiereNiveau: {
      coefficient: Decimal;
    };
  };
}

export function grouperNotesParMatiere(notes: any[]): Record<number, NoteData[]> {
  const map: Record<number, NoteData[]> = {};
  notes.forEach((n) => {
    const mnId = n.evaluation.matiereNiveauId;
    if (!map[mnId]) map[mnId] = [];
    map[mnId].push(n);
  });
  return map;
}

export function calculerMoyenneGenerale(notesParMatiere: Record<number, NoteData[]>): number {
  let sommeMoyennesCoeff = 0;
  let sommeCoeffsMatiere = 0;

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

  return sommeCoeffsMatiere > 0 ? sommeMoyennesCoeff / sommeCoeffsMatiere : 0;
}

/**
 * Utilise l'Enum officiel de Prisma pour garantir la compatibilité avec la base de données.
 */
export function determinerMention(moyenne: number): MentionBulletin {
  if (moyenne >= 16) return MentionBulletin.exc;
  if (moyenne >= 14) return MentionBulletin.bien;
  if (moyenne >= 12) return MentionBulletin.as_bien;
  if (moyenne >= 10) return MentionBulletin.pass;
  return MentionBulletin.aver;
}

export function toDecimal(value: number, precision = 2): Decimal {
  return new Decimal(value.toFixed(precision));
}