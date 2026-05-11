import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCategorieTarifaireDto } from './dto/create-categorie-tarifaire.dto';
import { UpdateCategorieTarifaireDto } from './dto/update-categorie-tarifaire.dto';

@Injectable()
export class CategorieTarifaireService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateCategorieTarifaireDto) {
    return this.databaseService.categorieTarifaire.create({
      data: dto,
    });
  }

  async findAll() {
    return this.databaseService.categorieTarifaire.findMany({
      include: {
        _count: {
          select: { inscriptions: true, tarifs: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const category = await this.databaseService.categorieTarifaire.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException(`Catégorie ${id} non trouvée`);
    return category;
  }

  async update(id: number, dto: UpdateCategorieTarifaireDto) {
    try {
      return await this.databaseService.categorieTarifaire.update({
        where: { id },
        data: dto,
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException(`Catégorie ${id} non trouvée`);
      throw error;
    }
  }

  async remove(id: number) {
    // Vérifier si la catégorie est utilisée avant de supprimer
    const category = await this.databaseService.categorieTarifaire.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inscriptions: true, tarifs: true },
        },
      },
    });

    if (!category) throw new NotFoundException(`Catégorie ${id} non trouvée`);

    if (category._count.inscriptions > 0) {
      throw new BadRequestException(
        'Impossible de supprimer cette catégorie car elle est liée à des inscriptions actives.',
      );
    }

    return this.databaseService.categorieTarifaire.delete({
      where: { id },
    });
  }
}
