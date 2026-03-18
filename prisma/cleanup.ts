import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Nettoyage de la base de données (Ordre strict)...');
  
  // Niveau 1 (Feuilles les plus dépendantes)
  await prisma.note.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.sanction.deleteMany();
  await prisma.paiement.deleteMany();
  
  // Niveau 2
  await prisma.bulletin.deleteMany();
  await prisma.inscription.deleteMany();
  await prisma.parentEleve.deleteMany();
  await prisma.creneau.deleteMany();
  await prisma.evaluation.deleteMany();

  // Niveau 3
  await prisma.matiereNiveau.deleteMany();
  
  // Niveau 4
  await prisma.parent.deleteMany();
  await prisma.eleve.deleteMany();
  await prisma.enseignant.deleteMany();

  // Niveau 5
  await prisma.user.deleteMany();
  
  // Niveau 6
  await prisma.rubriqueFinanciere.deleteMany();
  await prisma.periode.deleteMany();
  await prisma.classe.deleteMany();
  await prisma.etablissementConfig.deleteMany();
  
  // Niveau 7
  await prisma.matiere.deleteMany();
  await prisma.anneeScolaire.deleteMany();

  console.log('Base de données nettoyée !');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
