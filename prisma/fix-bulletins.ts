import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 DÉBUT DE LA MIGRATION DES DONNÉES : Affectation des classes aux bulletins...');

  const bulletins = await prisma.bulletin.findMany({
    where: { classeId: null },
    include: { periode: true },
  });

  console.log(`🔍 ${bulletins.length} bulletins à mettre à jour found.`);

  for (const bulletin of bulletins) {
    // Trouver l'inscription de l'élève pour l'année de la période du bulletin
    const inscription = await prisma.inscription.findFirst({
      where: {
        eleveId: bulletin.eleveId,
        anneeId: bulletin.periode.anneeId,
      },
    });

    if (inscription) {
      await prisma.bulletin.update({
        where: { id: bulletin.id },
        data: { classeId: inscription.classeId },
      });
      console.log(`✅ Bulletin #${bulletin.id} (Élève ${bulletin.eleveId}) -> Classe ${inscription.classeId}`);
    } else {
      console.warn(`⚠️ Aucune inscription trouvée pour l'élève ${bulletin.eleveId} sur l'année de la période ${bulletin.periodeId}`);
    }
  }

  console.log('🏁 MIGRATION TERMINÉE !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
