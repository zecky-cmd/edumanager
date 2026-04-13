import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BulletinRangService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Attribue les rangs en gérant les ex-æquos.
   */
  async attribuerRangs(classeId: number, periodeId: number) {
    const bulletins = await this.databaseService.bulletin.findMany({
      where: {
        periodeId,
        eleve: { inscriptions: { some: { classeId } } },
      },
      orderBy: { moyenneGenerale: 'desc' },
    });

    let currentRang = 1;
    const updates = bulletins.map((b, index) => {
      const prev = bulletins[index - 1];
      
      // Sécurité : Vérifier que les moyennes existent avant de les comparer
      if (
        index > 0 && 
        b.moyenneGenerale && 
        prev.moyenneGenerale &&
        (b.moyenneGenerale as any).equals(prev.moyenneGenerale)
      ) {
        // Ex-æquo : on garde le même rang
      } else {
        currentRang = index + 1;
      }

      return this.databaseService.bulletin.update({
        where: { id: b.id },
        data: { rang: currentRang },
      });
    });

    await Promise.all(updates);
    return { count: updates.length };
  }
}