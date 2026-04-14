import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { BulletinCalculService } from './sub-services/bulletin-calcul.service';
import { BulletinRangService } from './sub-services/bulletin-rang.service';
import { CreateBulletinDto } from './dto/create-bulletin.dto';
import { CalculClasseDto } from './dto/calcul-classe.dto';

@Injectable()
export class BulletinService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly calculService: BulletinCalculService,
    private readonly rangService: BulletinRangService,
  ) {}

  async create(dto: CreateBulletinDto) {
    const eleve = await this.databaseService.eleve.findUnique({ where: { id: dto.eleveId } });
    if (!eleve) throw new NotFoundException(`Élève ${dto.eleveId} non trouvé`);

    return this.databaseService.bulletin.create({
      data: dto as any,
      include: { eleve: { include: { user: true } }, periode: true },
    });
  }

  async calculerResultats(eleveId: number, periodeId: number, valideParId: number) {
    return this.calculService.calculerResultats(eleveId, periodeId, valideParId);
  }

  async attribuerRangs(classeId: number, periodeId: number) {
    return this.rangService.attribuerRangs(classeId, periodeId);
  }

  /**
   * Calcule les bulletins de tous les élèves d'une classe et attribue les rangs.
   */
  async calculerClasseResultats(dto: CalculClasseDto) {
    const { classeId, periodeId, valideParId } = dto;

    // 1. Trouver tous les élèves inscrits dans cette classe
    const inscriptions = await this.databaseService.inscription.findMany({
      where: { classeId },
      select: { eleveId: true },
    });

    // 2. Calculer les résultats pour chaque élève (Séquentiel pour la stabilité)
    for (const ins of inscriptions) {
      await this.calculerResultats(ins.eleveId, periodeId, valideParId);
    }

    // 3. Attribuer les rangs (une fois que toutes les moyennes sont là)
    return this.attribuerRangs(classeId, periodeId);
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