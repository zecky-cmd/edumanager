import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Initialisation du référentiel de base (Année + Classes)...');

  // 1. Admin par défaut
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password,
      role: 'adm',
      nom: 'SYSTEM',
      prenom: 'Admin',
    },
  });

  // 2. Année Scolaire 2024-2025 (ID 10 forcé si possible, sinon on s'adapte)
  const annee = await prisma.anneeScolaire.create({
    data: {
      libelle: '2024-2025',
      dateDebut: new Date('2024-09-01'),
      dateFin: new Date('2025-06-30'),
      modeEval: 'trim',
      periodes: {
        create: [
          { numero: 1, libelle: 'Trimestre 1', dateDebut: new Date('2024-09-01'), dateFin: new Date('2024-12-15'), statut: 'ouv' },
          { numero: 2, libelle: 'Trimestre 2', dateDebut: new Date('2025-01-05'), dateFin: new Date('2025-03-30'), statut: 'ouv' },
          { numero: 3, libelle: 'Trimestre 3', dateDebut: new Date('2025-04-15'), dateFin: new Date('2025-06-15'), statut: 'ouv' },
        ],
      },
    },
  });

  console.log(`Année Scolaire créée avec l'ID: ${annee.id}`);

  // 3. Configuration active
  await prisma.etablissementConfig.upsert({
    where: { id: 1 },
    update: { anneeActiveId: annee.id },
    create: {
      nom: 'EduManager School',
      anneeActiveId: annee.id,
    },
  });

  // 4. Création des Classes (6ème à Terminale)
  const niveaux = [
    { nom: '6ème', cycle: 'col' as const },
    { nom: '5ème', cycle: 'col' as const },
    { nom: '4ème', cycle: 'col' as const },
    { nom: '3ème', cycle: 'col' as const },
    { nom: '2nde', cycle: 'lyc' as const, series: ['A', 'C'] },
    { nom: '1ère', cycle: 'lyc' as const, series: ['A', 'C', 'D'] },
    { nom: 'Tle', cycle: 'lyc' as const, series: ['A', 'C', 'D'] },
  ];

  for (const n of niveaux) {
    if (n.series) {
      for (const s of n.series) {
        await prisma.classe.create({
          data: {
            nom: `${n.nom} ${s}`,
            niveau: n.nom,
            cycle: n.cycle,
            serie: s,
            anneeId: annee.id,
          },
        });
      }
    } else {
      // Pour le collège, on crée A et B
      for (const s of ['A', 'B']) {
        await prisma.classe.create({
          data: {
            nom: `${n.nom} ${s}`,
            niveau: n.nom,
            cycle: n.cycle,
            anneeId: annee.id,
          },
        });
      }
    }
  }

  console.log('Référentiel de base initialisé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
