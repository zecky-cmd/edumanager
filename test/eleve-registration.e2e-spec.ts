import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('Enregistrement Massif Elèves (E2E)', () => {
  let app: INestApplication;
  let prisma: DatabaseService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get<DatabaseService>(DatabaseService);

    // Login pour obtenir le token admin (créé par le seed-base)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@school.com', password: 'password123' });
    
    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('devrait enregistrer 100 élèves dans différentes classes', async () => {
    const config = await prisma.etablissementConfig.findFirst({
      include: { anneeActive: true },
    });
    const anneeId = config.anneeActiveId;
    const classes = await prisma.classe.findMany({ where: { anneeId } });

    expect(classes.length).toBeGreaterThan(0);
    console.log(`Début de l'injection de 100 élèves pour l'année ID: ${anneeId}`);

    const runId = Date.now();
    for (let i = 1; i <= 100; i++) {
      const randomClasse = classes[Math.floor(Math.random() * classes.length)];
      
      const eleveData = {
        nom: `NOM_TEST_${i}`,
        prenom: `Prenom_${i}`,
        email: `student_${runId}_${i}@school.com`,
        password: 'password123',
        sexe: i % 2 === 0 ? 'F' : 'M',
        dateNaissance: '2010-01-01',
        lieuNaissance: 'Abidjan',
        nationalite: 'Ivoirienne',
        classeId: randomClasse.id,
        anneeId: anneeId,
      };

      const response = await request(app.getHttpServer())
        .post('/eleve/inscription-complete')
        .set('Authorization', `Bearer ${token}`)
        .send(eleveData);

      if (response.status !== 201) {
        console.error(`Erreur élève ${i}:`, response.body);
      }
      
      expect(response.status).toBe(201);
    }

    const count = await prisma.eleve.count();
    console.log(`Injection terminée. Total élèves en base: ${count}`);
  }, 300000);
});
