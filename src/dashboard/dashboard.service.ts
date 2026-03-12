import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getGlobalStats() {
    // 1. Déterminer l'année scolaire active
    const config = await this.databaseService.etablissementConfig.findFirst();
    const anneeId = config?.anneeActiveId;
    if (!anneeId) throw new NotFoundException("Aucune année scolaire active");

    // 2. Statistiques Effectifs
    const totalEleves = await this.databaseService.eleve.count({
      where: { inscriptions: { some: { anneeId } } },
    });
    const garcons = await this.databaseService.eleve.count({
      where: { sexe: 'M', inscriptions: { some: { anneeId } } },
    });
    const filles = await this.databaseService.eleve.count({
      where: { sexe: 'F', inscriptions: { some: { anneeId } } },
    });

    // 3. Statistiques Financières (Recouvrement Global)
    // a. Calculer le total attendu (Rubriques obligatoires * Nombre d'élèves concernés)
    const rubriques = await this.databaseService.rubriqueFinanciere.findMany({
      where: { anneeId, estObligatoire: true },
    });

    let totalAttendu = 0;
    for (const r of rubriques) {
      const montant = parseFloat(r.montant.toString());
      let count = 0;
      if (r.cycle === 'tous') {
        count = totalEleves;
      } else {
        count = await this.databaseService.eleve.count({
          where: { inscriptions: { some: { anneeId, classe: { cycle: r.cycle as any } } } },
        });
      }
      totalAttendu += montant * count;
    }

    // b. Calculer le total déjà payé pour cette année
    const paiements = await this.databaseService.paiement.aggregate({
      where: { rubrique: { anneeId } },
      _sum: { montant: true },
    });
    const totalPaye = parseFloat(paiements._sum.montant?.toString() || '0');

    // 4. Statistiques Pédagogiques (Meilleures moyennes)
    const topBulletins = await this.databaseService.bulletin.findMany({
      where: { periode: { anneeId } },
      orderBy: { moyenneGenerale: 'desc' },
      take: 5,
      include: { eleve: { include: { user: true } } },
    });

    return {
      eleves: {
        total: totalEleves,
        garcons,
        filles,
      },
      finances: {
        totalAttendu,
        totalPaye,
        tauxRecouvrement: totalAttendu > 0 ? (totalPaye / totalAttendu) * 100 : 0,
      },
      pedagogie: {
        topEleves: topBulletins.map((b) => ({
          nom: `${b.eleve.user?.nom} ${b.eleve.user?.prenom}`,
          moyenne: b.moyenneGenerale,
        })),
      },
    };
  }
}
