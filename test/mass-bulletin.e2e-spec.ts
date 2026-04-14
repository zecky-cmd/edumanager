import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('Génération Massive Bulletins (E2E)', () => {
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

  it('devrait calculer les bulletins et les rangs de toutes les classes', async () => {
    const config = await prisma.etablissementConfig.findFirst({
        include: { anneeActive: { include: { periodes: true } } }
    });
    const anneeId = config.anneeActiveId;
    const periodeId = config.anneeActive.periodes[0].id; // Trimestre 1
    const classes = await prisma.classe.findMany({ where: { anneeId } });

    console.log(`Début du calcul des bulletins pour ${classes.length} classes (Année: ${anneeId}, Période: ${periodeId})`);

    for (const classe of classes) {
        console.log(`Calcul pour la classe : ${classe.nom}...`);
        
        const response = await request(app.getHttpServer())
            .post('/bulletin/calculer-classe')
            .set('Authorization', `Bearer ${token}`)
            .send({
                classeId: classe.id,
                periodeId: periodeId,
                valideParId: adminId
            });

        expect(response.status).toBe(201);
    }

    const bulletinCount = await prisma.bulletin.count({ where: { periodeId } });
    console.log(`Génération terminée. Total bulletins créés: ${bulletinCount}`);

    // Affichage d'un petit podium pour le fun
    const topStudents = await prisma.bulletin.findMany({
        where: { periodeId, rang: 1 },
        include: { eleve: { include: { user: true } }, classe: true },
        orderBy: { moyenneGenerale: 'desc' },
        take: 5
    });

    console.log('\n--- 🏆 PODIUM DES MAJORS (Top 5 de l\'école) ---');
    topStudents.forEach((b, i) => {
        console.log(`${i+1}. ${b.eleve.user.nom} ${b.eleve.user.prenom} (${b.classe.nom}) - Moyenne: ${b.moyenneGenerale.toString()}/20`);
    });
  }, 600000);
});
