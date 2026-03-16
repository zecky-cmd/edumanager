import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Calcul des résultats pour le scénario "Les Elites"...');

  const annee = await prisma.anneeScolaire.findFirst({ where: { libelle: '2025-2026' } });
  const periode = await prisma.periode.findFirst({ where: { anneeId: annee!.id } });
  const classe = await prisma.classe.findFirst({ where: { nom: '2nde C' } });
  const admin = await prisma.user.findFirst({ where: { role: 'adm' } });

  const eleves = await prisma.eleve.findMany({
    where: { inscriptions: { some: { classeId: classe!.id } } },
    include: { user: true }
  });

  // --- 1. Calcul des moyennes par élève ---
  for (const eleve of eleves) {
    const notes = await prisma.note.findMany({
      where: { eleveId: eleve.id, evaluation: { periodeId: periode!.id } },
      include: { evaluation: { include: { matiereNiveau: true } } }
    });

    const notesParMatiere: Record<number, any[]> = {};
    notes.forEach(n => {
      const mnId = n.evaluation.matiereNiveauId;
      if (!notesParMatiere[mnId]) notesParMatiere[mnId] = [];
      notesParMatiere[mnId].push(n);
    });

    let sommeMoyennesCoeff = 0;
    let sommeCoeffsMatiere = 0;

    for (const mnId in notesParMatiere) {
      const notesMatiere = notesParMatiere[mnId];
      const mn = notesMatiere[0].evaluation.matiereNiveau;

      let sommePoints = 0;
      let sommeCoeffsEval = 0;
      notesMatiere.forEach(n => {
        if (n.valeur) {
          sommePoints += Number(n.valeur) * Number(n.evaluation.coefficient);
          sommeCoeffsEval += Number(n.evaluation.coefficient);
        }
      });

      if (sommeCoeffsEval > 0) {
        const moyMatiere = sommePoints / sommeCoeffsEval;
        sommeMoyennesCoeff += moyMatiere * Number(mn.coefficient);
        sommeCoeffsMatiere += Number(mn.coefficient);
      }
    }

    const moyGen = sommeCoeffsMatiere > 0 ? sommeMoyennesCoeff / sommeCoeffsMatiere : 0;
    let mention: any = 'aver';
    if (moyGen >= 16) mention = 'exc';
    else if (moyGen >= 14) mention = 'bien';
    else if (moyGen >= 10) mention = 'pass';

    await prisma.bulletin.upsert({
      where: { eleveId_periodeId: { eleveId: eleve.id, periodeId: periode!.id } },
      update: { moyenneGenerale: moyGen, mention, valideParId: admin!.id },
      create: { eleveId: eleve.id, periodeId: periode!.id, moyenneGenerale: moyGen, mention, valideParId: admin!.id }
    });
    console.log(`Moyenne calculée pour ${eleve.user?.nom}: ${moyGen.toFixed(2)}`);
  }

  // --- 2. Calcul des Rangs ---
  const bulletins = await prisma.bulletin.findMany({
    where: { periodeId: periode!.id, eleve: { inscriptions: { some: { classeId: classe!.id } } } },
    orderBy: { moyenneGenerale: 'desc' }
  });

  for (let i = 0; i < bulletins.length; i++) {
    await prisma.bulletin.update({
      where: { id: bulletins[i].id },
      data: { rang: i + 1 }
    });
  }
  console.log('Rangs attribués avec succès !');

  // --- 3. Affichage final ---
  const results = await prisma.bulletin.findMany({
    where: { periodeId: periode!.id },
    include: { eleve: { include: { user: true } } },
    orderBy: { rang: 'asc' }
  });

  console.log('\n--- RÉSULTATS FINAUX (2nde C) ---');
  results.forEach(r => {
    console.log(`${r.rang}er: ${r.eleve.user?.nom} ${r.eleve.user?.prenom} - Moyenne: ${r.moyenneGenerale} (${r.mention})`);
  });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
