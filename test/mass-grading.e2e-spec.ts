import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('Notation Massive (E2E)', () => {
  let app: INestApplication;
  let prisma: DatabaseService;
  let token: string;
  let adminId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get<DatabaseService>(DatabaseService);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@school.com', password: 'password123' });
    
    token = loginResponse.body.access_token;
    adminId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('devrait générer des notes pour tous les élèves dans toutes les matières', async () => {
    // 1. Récupérer toutes les liaisons Matiere-Niveau (Profs/Classes/Matières)
    const matiereNiveaux = await prisma.matiereNiveau.findMany({
        include: { classe: true }
    });

    // 2. Récupérer la période active
    const config = await prisma.etablissementConfig.findFirst({
        include: { anneeActive: { include: { periodes: true } } }
    });
    const periodeId = config.anneeActive.periodes[0].id;

    console.log(`Début de la notation massive pour ${matiereNiveaux.length} matières/classes.`);

    for (const mn of matiereNiveaux) {
        // Trouver tous les élèves de cette classe
        const inscriptions = await prisma.inscription.findMany({
            where: { classeId: mn.classeId, anneeId: config.anneeActiveId }
        });

        if (inscriptions.length === 0) continue;

        console.log(`Saisie pour ${mn.classe.nom} - ${mn.matiereId} (${inscriptions.length} élèves)`);

        const evalData = {
            matiereNiveauId: mn.id,
            periodeId: periodeId,
            saisiParId: adminId,
            titre: 'Examen de mi-trimestre',
            type: 'DS',
            dateEvaluation: new Date(),
            coefficient: parseFloat(mn.coefficient.toString()),
            notes: inscriptions.map(ins => ({
                eleveId: ins.eleveId,
                valeur: Math.floor(Math.random() * (20 - 7 + 1)) + 7, // Notes entre 7 et 20
                appreciation: 'Auto-généré'
            }))
        };

        const response = await request(app.getHttpServer())
            .post('/evaluation/saisie-collective')
            .set('Authorization', `Bearer ${token}`)
            .send(evalData);

        if (response.status !== 201) {
            console.error('ERREUR API :', response.status, response.body);
        }

        expect(response.status).toBe(201);
    }

    const noteCount = await prisma.note.count();
    console.log(`Notation terminée. Total notes en base: ${noteCount}`);
  }, 600000); // 10 minutes max
});
