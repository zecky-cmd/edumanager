import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateRubriqueFinanciereDto } from './dto/create-rubrique-financiere.dto';
import { UpdateRubriqueFinanciereDto } from './dto/update-rubrique-financiere.dto';

@Injectable()
export class RubriqueFinanciereService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateRubriqueFinanciereDto) {
    const { tarifs, ...rubriqueData } = dto;

    const annee = await this.databaseService.anneeScolaire.findUnique({
      where: { id: dto.anneeId },
    });
    if (!annee)
      throw new NotFoundException(`Année scolaire ${dto.anneeId} non trouvée`);

    // Création atomique avec les tarifs
    return this.databaseService.rubriqueFinanciere.create({
      data: {
        ...rubriqueData,
        tarifs: tarifs
          ? {
              create: tarifs.map((t) => ({
                niveau: t.niveau,
                categorieId: t.categorieId,
                montant: t.montant,
              })),
            }
          : undefined,
      },
      include: { tarifs: true },
    });
  }

  async findAll(anneeId?: number) {
    return this.databaseService.rubriqueFinanciere.findMany({
      where: anneeId ? { anneeId } : {},
      include: {
        tarifs: {
          include: { categorie: true },
        },
      },
      orderBy: { ordre: 'asc' },
    });
  }

  async findOne(id: number) {
    const rubrique = await this.databaseService.rubriqueFinanciere.findUnique({
      where: { id },
      include: {
        tarifs: {
          include: { categorie: true },
        },
      },
    });
    if (!rubrique)
      throw new NotFoundException(`Rubrique financière ${id} non trouvée`);
    return rubrique;
  }

  async update(id: number, dto: UpdateRubriqueFinanciereDto) {
    const { tarifs, ...rubriqueData } = dto;

    try {
      // Pour l'update, si des tarifs sont fournis, on peut soit les écraser, soit les merger.
      // Le ticket demande "Mise à jour en masse". On va faire un delete/create pour simplifier si tarifs fournis.
      return await this.databaseService.$transaction(async (tx) => {
        if (tarifs) {
          await tx.tarifRubrique.deleteMany({ where: { rubriqueId: id } });
        }

        return tx.rubriqueFinanciere.update({
          where: { id },
          data: {
            ...rubriqueData,
            tarifs: tarifs
              ? {
                  create: tarifs.map((t) => ({
                    niveau: t.niveau,
                    categorieId: t.categorieId,
                    montant: t.montant,
                  })),
                }
              : undefined,
          },
          include: { tarifs: true },
        });
      });
    } catch (error: any) {
      if (error.code === 'P2025')
        throw new NotFoundException(`Rubrique financière ${id} non trouvée`);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.databaseService.rubriqueFinanciere.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025')
        throw new NotFoundException(`Rubrique financière ${id} non trouvée`);
      throw error;
    }
  }
}
