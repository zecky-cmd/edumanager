-- AlterTable
ALTER TABLE "Inscription" ADD COLUMN     "categorieTarifaireId" INTEGER;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_categorieTarifaireId_fkey" FOREIGN KEY ("categorieTarifaireId") REFERENCES "CategorieTarifaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;
