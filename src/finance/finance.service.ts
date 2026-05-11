import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsNumber, Min } from 'class-validator';

export class CopierTarifsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  sourceCategorieId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  destinationCategorieId: number;

  @ApiProperty({ required: false, description: 'Pourcentage de réduction (ex: 20 pour -20%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pourcentageReduction?: number;
}

@Injectable()
export class FinanceService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Copie tous les tarifs d'une catégorie vers une autre.
   * Utile pour créer rapidement une catégorie "Boursier" à partir de "Non-Affecté".
   */
  async copierGrilleTarifaire(dto: CopierTarifsDto) {
    const { sourceCategorieId, destinationCategorieId, pourcentageReduction } = dto;

    // 1. Vérifier les catégories
    const source = await this.databaseService.categorieTarifaire.findUnique({
      where: { id: sourceCategorieId },
      include: { tarifs: true },
    });
    if (!source) throw new NotFoundException('Catégorie source non trouvée');

    const dest = await this.databaseService.categorieTarifaire.findUnique({
      where: { id: destinationCategorieId },
    });
    if (!dest) throw new NotFoundException('Catégorie destination non trouvée');

    // 2. Préparer les nouveaux tarifs
    const multiplier = pourcentageReduction ? (100 - pourcentageReduction) / 100 : 1;

    const nouveauxTarifs = source.tarifs.map((t) => ({
      rubriqueId: t.rubriqueId,
      categorieId: destinationCategorieId,
      niveau: t.niveau,
      montant: Number(t.montant) * multiplier,
    }));

    // 3. Exécuter en transaction (Delete existing if any, then Create)
    return this.databaseService.$transaction(async (tx) => {
      // On nettoie la destination pour les rubriques impactées
      for (const t of nouveauxTarifs) {
        await tx.tarifRubrique.deleteMany({
          where: {
            categorieId: destinationCategorieId,
            rubriqueId: t.rubriqueId,
            niveau: t.niveau,
          },
        });
      }

      // On insère les nouveaux
      return tx.tarifRubrique.createMany({
        data: nouveauxTarifs,
      });
    });
  }

  /**
   * Calcule le montant TOTAL que doit payer un élève pour son inscription.
   */
  async calculerTotalDu(eleveId: number, anneeId: number) {
    const inscription = await this.databaseService.inscription.findFirst({
      where: { eleveId, anneeId },
      include: {
        classe: true,
        categorieTarifaire: {
          include: {
            tarifs: {
              where: {
                rubrique: { anneeId, estObligatoire: true },
              },
            },
          },
        },
      },
    });

    if (!inscription || !inscription.categorieTarifaire) return 0;

    // On filtre les tarifs qui correspondent au NIVEAU de l'élève
    const tarifsConcernes = inscription.categorieTarifaire.tarifs.filter(
      (t) => t.niveau === inscription.classe.niveau,
    );

    return tarifsConcernes.reduce((acc, t) => acc + Number(t.montant), 0);
  }
}
