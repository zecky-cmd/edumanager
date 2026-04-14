import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Création du référentiel académique (Profs + Matières)...');

  const config = await prisma.etablissementConfig.findFirst();
  const anneeId = config?.anneeActiveId;

  if (!anneeId) {
    console.error('Aucune année active trouvée. Lance le seed-base d\'abord.');
    return;
  }

  // 1. Création des Matières
  const matNames = [
    { nom: 'Mathématiques', code: 'MATH', color: '#ff0000' },
    { nom: 'Français', code: 'FRAN', color: '#0000ff' },
    { nom: 'Anglais', code: 'ANGL', color: '#00ff00' },
    { nom: 'Physique-Chimie', code: 'PHYS', color: '#ffff00' },
    { nom: 'SVT', code: 'SVT', color: '#00ffff' },
  ];

  const matieres: any[] = [];
  for (const m of matNames) {
    const mat = await prisma.matiere.upsert({
      where: { code: m.code },
      update: {},
      create: { nom: m.nom, code: m.code, couleur: m.color },
    });
    matieres.push(mat);
  }

  // 2. Création des Enseignants
  const password = await bcrypt.hash('password123', 10);
  const profsData = [
    { nom: 'KOUASSI', prenom: 'Blaise', email: 'prof.math@school.com', spec: 'Mathématiques' },
    { nom: 'DIALLO', prenom: 'Mariam', email: 'prof.francais@school.com', spec: 'Français' },
    { nom: 'TOURE', prenom: 'Amadou', email: 'prof.anglais@school.com', spec: 'Anglais' },
  ];

  const enseignants: any[] = [];
  for (const p of profsData) {
    const ens = await prisma.enseignant.upsert({
      where: { matricule: `MAT-${p.nom}` },
      update: {},
      create: {
        matricule: `MAT-${p.nom}`,
        specialite: p.spec,
        user: {
          create: {
            email: p.email,
            password,
            role: 'ens',
            nom: p.nom,
            prenom: p.prenom,
          },
        },
      },
    });
    enseignants.push(ens);
  }

  // 3. Liaison Matiere-Niveau (MatiereNiveau) pour toutes les classes
  const classes = await prisma.classe.findMany({ where: { anneeId } });
  
  for (const classe of classes) {
    for (let i = 0; i < matieres.length; i++) {
        // On assigne un prof aléatoirement (modulo pour simplifier)
        const prof = enseignants[i % enseignants.length];
        
        await prisma.matiereNiveau.upsert({
            where: { classeId_matiereId: { classeId: classe.id, matiereId: matieres[i].id } },
            update: {},
            create: {
                classeId: classe.id,
                matiereId: matieres[i].id,
                enseignantId: prof.id,
                coefficient: i === 0 ? 5 : 2, // Les maths coeff 5, le reste 2
                noteMax: 20
            }
        });
    }
  }

  console.log(`Liaisons terminées pour ${classes.length} classes.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
