import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { grouperNotesParMatiere, calculerMoyenneGenerale, determinerMention, toDecimal } from '../helpers/bulletin.helpers.service';

@Injectable()
export class BulletinCalculService {
  constructor(private readonly databaseService: DatabaseService) {}

  async calculerResultats(eleveId: number, periodeId: number, valideParId: number) {
    const notes = await this._fetchNotes(eleveId, periodeId);
    if (notes.length === 0) return null;

    const notesParMatiere = grouperNotesParMatiere(notes);
    const moyenneGenerale = calculerMoyenneGenerale(notesParMatiere);
    const mention = determinerMention(moyenneGenerale);

    const inscription = await this._fetchInscription(eleveId, periodeId);

    return this.databaseService.bulletin.upsert({
      where: { eleveId_periodeId: { eleveId, periodeId } },
      update: {
        moyenneGenerale: toDecimal(moyenneGenerale),
        mention,
        valideParId,
        classeId: inscription.classeId,
      },
      create: {
        eleveId,
        periodeId,
        moyenneGenerale: toDecimal(moyenneGenerale),
        mention,
        valideParId,
        classeId: inscription.classeId,
      },
    });
  }

  // --- Méthodes privées de fetch ---

  private async _fetchNotes(eleveId: number, periodeId: number) {
    return this.databaseService.note.findMany({
      where: { eleveId, evaluation: { periodeId } },
      include: { evaluation: { include: { matiereNiveau: true } } },
    });
  }

  private async _fetchInscription(eleveId: number, periodeId: number) {
    const inscription = await this.databaseService.inscription.findFirst({
      where: {
        eleveId,
        annee: { periodes: { some: { id: periodeId } } },
      },
    });
    if (!inscription) throw new NotFoundException(`Aucune inscription trouvée pour l'élève ${eleveId}`);
    return inscription;
  }
}