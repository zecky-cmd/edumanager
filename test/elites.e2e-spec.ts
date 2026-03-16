import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaClient } from '@prisma/client';

describe('Scénario "Les Elites" (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  const prisma = new PrismaClient();

  // Avant de lancer les tests, on initialise l'application et on nettoie la DB
  beforeAll(async () => {
    // Nettoyage de la DB pour repartir à zéro
    await prisma.note.deleteMany();
    await prisma.bulletin.deleteMany();
    await prisma.inscription.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.matiereNiveau.deleteMany();
    await prisma.eleve.deleteMany();
    await prisma.user.deleteMany({ where: { NOT: { email: 'admin@school.com' } } });
    await prisma.classe.deleteMany();
    await prisma.anneeScolaire.deleteMany();
    await prisma.matiere.deleteMany();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  // Après les tests, on ferme tout proprement
  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('Phase 1 : Authentification', () => {
    it('Sénario 1.1 : Devrait échouer avec de mauvais identifiants (401)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@school.com',
          password: 'mauvais-password',
        })
        .expect(401);
    });

    it('Sénario 1.2 : Devrait se connecter avec succès et renvoyer un Token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@school.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      adminToken = response.body.access_token;
    });
  });

  describe('Phase 2 : Configuration de la Structure', () => {
    let anneeId: number;
    let classeId: number;

    it('Sénario 2.1 : Création de l\'année scolaire (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/annee-scolaire')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          libelle: '2025-2026 (E2E Test)',
          dateDebut: '2025-09-01',
          dateFin: '2026-06-30',
          modeEval: 'sem',
        })
        .expect(201);

      anneeId = response.body.id;
    });

    it('Sénario 2.2 : Création de la classe 2nde C (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/classe')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: '2nde C (E2E)',
          cycle: 'lyc',
          niveau: 'Seconde',
          serie: 'C',
          anneeId: anneeId,
        })
        .expect(201);

      classeId = response.body.id;
    });

    describe('Phase 3 : Flux Pédagogique (Élèves & Notes)', () => {
      let eleveId: number;
      let periodeId: number;

      it('Sénario 3.1 : Récupération de la période', async () => {
        const response = await request(app.getHttpServer())
          .get(`/periode?anneeId=${anneeId}`) // Filtrer par l'année qu'on vient de créer
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        periodeId = response.body[0].id;
      });

      it('Sénario 3.2 : Inscription de l\'élève KOFFI', async () => {
        const response = await request(app.getHttpServer())
          .post('/eleve')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            matricule: 'E2E-KOFFI',
            sexe: 'M',
            user: {
              email: 'koffi.e2e@school.com',
              password: 'password123',
              nom: 'KOFFI',
              prenom: 'Jean'
            }
          })
          .expect(201);
        
        eleveId = response.body.id;

        // On doit l'inscrire à la classe !
        await request(app.getHttpServer())
          .post('/inscription')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            eleveId: eleveId,
            classeId: classeId,
            anneeId: anneeId
          })
          .expect(201);
      });

      it('Sénario 3.3 : Cycle Complet Matière -> Éval -> Note', async () => {
        // 1. Matière
        const mRes = await request(app.getHttpServer())
          .post('/matiere')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ nom: 'Maths E2E', code: 'ME2E', cycle: 'lyc' })
          .expect(201);
        
        // 2. Affectation (MatiereNiveau)
        const mnRes = await request(app.getHttpServer())
          .post('/matiere-niveau')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            classeId: classeId,
            matiereId: mRes.body.id,
            coefficient: 5,
            enseignantId: 1 // On suppose que l'admin est enseignantId 1 ou on en crée un
          })
          .expect(201);

        // 3. Évaluation
        const evalRes = await request(app.getHttpServer())
          .post('/evaluation')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            matiereNiveauId: mnRes.body.id,
            periodeId: periodeId,
            titre: 'DS 1',
            type: 'DS',
            coefficient: 1,
            dateEvaluation: '2025-10-10'
          })
          .expect(201);

        // 4. Note
        await request(app.getHttpServer())
          .post('/note')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            evaluationId: evalRes.body.id,
            eleveId: eleveId,
            valeur: 18
          })
          .expect(200);
      });

      it('Sénario 3.4 : Bulletin & Moyenne', async () => {
        await request(app.getHttpServer())
          .post(`/bulletin/generate-eleve/${eleveId}/${periodeId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(201);

        const response = await request(app.getHttpServer())
          .get(`/bulletin/eleve/${eleveId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const bulletin = response.body.find((b: any) => b.periodeId === periodeId);
        expect(bulletin.moyenneGenerale).toBe("18.00"); // Decimal renvoyé sous forme de string
        expect(bulletin.classeId).toBe(classeId); // VÉRIFICATION CRUCIALE !
      });
    });
  });
});
