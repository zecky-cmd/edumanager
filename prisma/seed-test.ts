import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Démarrage du seed pour le scénario "Les Elites"...');

  // --- 1. Année Scolaire & Période ---
  const annee = await prisma.anneeScolaire.create({
    data: {
      libelle: '2025-2026',
      dateDebut: new Date('2025-09-01'),
      dateFin: new Date('2026-06-30'),
      modeEval: 'sem',
      periodes: {
        create: {
          numero: 1,
          libelle: '1er Semestre',
          dateDebut: new Date('2025-09-01'),
          dateFin: new Date('2026-01-31'),
          statut: 'ouv',
        },
      },
    },
  });
  const periode = await prisma.periode.findFirst({ where: { anneeId: annee.id } });

  // --- 2. Configuration Etablissement ---
  await prisma.etablissementConfig.create({
    data: {
      nom: 'Groupe Scolaire Les Elites',
      anneeActiveId: annee.id,
      devise: 'FCFA',
    },
  });

  // --- 3. Classe ---
  const classe = await prisma.classe.create({
    data: {
      nom: '2nde C',
      cycle: 'lyc',
      niveau: 'Seconde',
      serie: 'C',
      anneeId: annee.id,
    },
  });

  // --- 4. Enseignants ---
  const password = await bcrypt.hash('password123', 10);
  
  const createTeacher = async (email: string, nom: string, prenom: string, spec: string) => {
    return prisma.enseignant.create({
      data: {
        specialite: spec,
        user: {
          create: {
            email,
            password,
            role: 'ens',
            nom,
            prenom,
          },
        },
      },
    });
  };

  const toure = await createTeacher('toure@school.com', 'TOURE', 'Moussa', 'Mathématiques');
  const diallo = await createTeacher('diallo@school.com', 'DIALLO', 'Awa', 'Physique-Chimie');

  // --- 5. Matières & Affectations ---
  const maths = await prisma.matiere.create({ data: { nom: 'Mathématiques', code: 'MATH2', cycle: 'lyc' } });
  const physique = await prisma.matiere.create({ data: { nom: 'Physique-Chimie', code: 'PHYS2', cycle: 'lyc' } });

  const mnMaths = await prisma.matiereNiveau.create({
    data: {
      classeId: classe.id,
      matiereId: maths.id,
      enseignantId: toure.id,
      coefficient: 5.0,
    },
  });

  const mnPhys = await prisma.matiereNiveau.create({
    data: {
      classeId: classe.id,
      matiereId: physique.id,
      enseignantId: diallo.id,
      coefficient: 4.0,
    },
  });

  // --- 6. Elèves & Inscriptions ---
  const createEleve = async (email: string, nom: string, prenom: string, matricule: string, sexe: 'M' | 'F') => {
    return prisma.eleve.create({
      data: {
        matricule,
        sexe,
        user: {
          create: {
            email,
            password,
            role: 'elv',
            nom,
            prenom,
          },
        },
        inscriptions: {
          create: {
            anneeId: annee.id,
            classeId: classe.id,
          },
        },
      },
    });
  };

  const koffi = await createEleve('koffi@school.com', 'KOFFI', 'Jean', 'ELITE001', 'M');
  const amenan = await createEleve('amenan@school.com', 'AMENAN', 'Marie', 'ELITE002', 'F');
  const yao = await createEleve('yao@school.com', 'YAO', 'Ahmed', 'ELITE003', 'M');

  // --- 7. Administrateur (pour valider bulletins) ---
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password,
      role: 'adm',
      nom: 'N\'ZORE',
      prenom: 'Didier',
    },
  });

  // --- 8. Evaluations & Notes ---
  // Evaluations de M. Touré (Maths)
  const evalMaths1 = await prisma.evaluation.create({
    data: {
      matiereNiveauId: mnMaths.id,
      periodeId: periode!.id,
      saisiParId: admin.id,
      titre: 'Interrogation 1',
      type: 'interro',
      coefficient: 1.0,
      dateEvaluation: new Date(),
    },
  });

  const createNote = async (evalId: number, eleveId: number, valeur: number) => {
    return prisma.note.create({
      data: {
        evaluationId: evalId,
        eleveId,
        valeur,
      },
    });
  };

  await createNote(evalMaths1.id, koffi.id, 18);
  await createNote(evalMaths1.id, amenan.id, 12);
  await createNote(evalMaths1.id, yao.id, 8);

  // Evaluation de Mme Diallo (Physique)
  const evalPhys1 = await prisma.evaluation.create({
    data: {
      matiereNiveauId: mnPhys.id,
      periodeId: periode!.id,
      saisiParId: admin.id,
      titre: 'DS 1',
      type: 'DS',
      coefficient: 3.0,
      dateEvaluation: new Date(),
    },
  });

  await createNote(evalPhys1.id, koffi.id, 15);
  await createNote(evalPhys1.id, amenan.id, 11);
  await createNote(evalPhys1.id, yao.id, 7);

  // --- 9. Finances ---
  const scolarite = await prisma.rubriqueFinanciere.create({
    data: {
      anneeId: annee.id,
      libelle: 'Scolarité 2nde C',
      montant: 500000,
      cycle: 'lyc',
    },
  });

  await prisma.paiement.create({
    data: {
      eleveId: koffi.id,
      rubriqueId: scolarite.id,
      encaisseParId: admin.id,
      montant: 300000,
      mode: 'esp',
    },
  });

  console.log('✅ Seed terminé avec succès !');
  console.log('Utilise les emails pour tester le login (password: password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
