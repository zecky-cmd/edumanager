import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';

@Injectable()
export class PaiementService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreatePaiementDto) {
    // Vérifier l'élève
    const eleve = await this.databaseService.eleve.findUnique({ where: { id: dto.eleveId } });
    if (!eleve) throw new NotFoundException(`Élève ${dto.eleveId} non trouvé`);

    // Vérifier la rubrique
    const rubrique = await this.databaseService.rubriqueFinanciere.findUnique({ where: { id: dto.rubriqueId } });
    if (!rubrique) throw new NotFoundException(`Rubrique ${dto.rubriqueId} non trouvée`);

    // Vérifier l'encaisseur
    const user = await this.databaseService.user.findUnique({ where: { id: dto.encaisseParId } });
    if (!user) throw new NotFoundException(`Utilisateur ${dto.encaisseParId} non trouvé`);

    return this.databaseService.paiement.create({
      data: dto as any,
      include: {
        eleve: { include: { user: true } },
        rubrique: true,
        encaissePar: true,
      },
    });
  }

  async findAll(eleveId?: number) {
    return this.databaseService.paiement.findMany({
      where: eleveId ? { eleveId } : {},
      include: {
        rubrique: true,
        eleve: { include: { user: true } },
      },
      orderBy: { datePaiement: 'desc' },
    });
  }

  async findOne(id: number) {
    const payment = await this.databaseService.paiement.findUnique({
      where: { id },
      include: {
        eleve: { include: { user: true } },
        rubrique: true,
        encaissePar: true,
      },
    });
    if (!payment) throw new NotFoundException(`Paiement ${id} non trouvé`);
    return payment;
  }

  async update(id: number, dto: UpdatePaiementDto) {
    try {
      return await this.databaseService.paiement.update({
        where: { id },
        data: dto as any,
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException(`Paiement ${id} non trouvé`);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.databaseService.paiement.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException(`Paiement ${id} non trouvé`);
      throw error;
    }
  }

  /**
   * Calcule la situation financière d'un élève pour l'année en cours.
   */
  async getSituationFinanciere(eleveId: number, anneeId?: number) {
    let finalAnneeId: number | undefined = anneeId;
    if (!finalAnneeId) {
      const config = await this.databaseService.etablissementConfig.findFirst();
      finalAnneeId = config?.anneeActiveId ?? undefined;
    }

    if (!finalAnneeId) throw new NotFoundException('Aucune année scolaire active trouvée');

    const inscription = await this.databaseService.inscription.findUnique({
      where: { anneeId_eleveId: { anneeId: finalAnneeId, eleveId } },
      include: {
        classe: true,
        categorieTarifaire: {
          include: {
            tarifs: {
              where: {
                rubrique: { anneeId: finalAnneeId, estObligatoire: true },
              },
              include: { rubrique: true },
            },
          },
        },
      },
    });

    if (!inscription)
      throw new NotFoundException(`Élève ${eleveId} non inscrit pour l'année ${finalAnneeId}`);

    // Initialisation des compteurs
    let totalDu = 0;
    let tarifsConcernes: any[] = [];
    const nomCategorie = inscription.categorieTarifaire?.nom || 'Non définie';

    // Calcul si une catégorie existe
    if (inscription.categorieTarifaire) {
      tarifsConcernes = inscription.categorieTarifaire.tarifs.filter(
        (t) => t.niveau === inscription.classe.niveau,
      );

      totalDu = tarifsConcernes.reduce(
        (sum, t) => sum + parseFloat(t.montant.toString()),
        0,
      );
    }

    // 4. Calculer le total déjà payé par l'élève pour cette année
    const paiements = await this.databaseService.paiement.findMany({
      where: {
        eleveId,
        rubrique: { anneeId: finalAnneeId },
      },
    });

    const totalPaye = paiements.reduce(
      (sum, p) => sum + parseFloat(p.montant.toString()),
      0,
    );

    return {
      eleveId,
      anneeId: finalAnneeId,
      categorie: nomCategorie,
      niveau: inscription.classe.niveau,
      totalDu,
      totalPaye,
      resteAPayer: totalDu - totalPaye,
      detailsTarifs: tarifsConcernes,
      statutCompte: inscription.categorieTarifaire ? 'complet' : 'categorie_manquante',
    };
  }
}
