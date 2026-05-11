/*
  Warnings:

  - You are about to drop the column `specialite` on the `Enseignant` table. All the data in the column will be lost.
  - You are about to drop the column `montant` on the `RubriqueFinanciere` table. All the data in the column will be lost.
  - Added the required column `classeId` to the `Bulletin` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('permanent', 'vacataire');

-- AlterEnum
ALTER TYPE "MentionBulletin" ADD VALUE 'as_bien';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypeEvaluation" ADD VALUE 'examen';
ALTER TYPE "TypeEvaluation" ADD VALUE 'TP';

-- AlterTable
ALTER TABLE "Bulletin" ADD COLUMN     "classeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Classe" ADD COLUMN     "enseignantPrincipalId" INTEGER;

-- AlterTable
ALTER TABLE "Enseignant" DROP COLUMN "specialite",
ADD COLUMN     "specialites" VARCHAR(100)[] DEFAULT ARRAY[]::VARCHAR(100)[],
ADD COLUMN     "typeContrat" "TypeContrat" NOT NULL DEFAULT 'permanent';

-- AlterTable
ALTER TABLE "RubriqueFinanciere" DROP COLUMN "montant";

-- CreateTable
CREATE TABLE "CategorieTarifaire" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategorieTarifaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarifRubrique" (
    "id" SERIAL NOT NULL,
    "rubriqueId" INTEGER NOT NULL,
    "categorieId" INTEGER NOT NULL,
    "niveau" VARCHAR(20) NOT NULL,
    "montant" DECIMAL(10,0) NOT NULL,

    CONSTRAINT "TarifRubrique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategorieTarifaire_nom_key" ON "CategorieTarifaire"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "TarifRubrique_rubriqueId_categorieId_niveau_key" ON "TarifRubrique"("rubriqueId", "categorieId", "niveau");

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_enseignantPrincipalId_fkey" FOREIGN KEY ("enseignantPrincipalId") REFERENCES "Enseignant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bulletin" ADD CONSTRAINT "Bulletin_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifRubrique" ADD CONSTRAINT "TarifRubrique_rubriqueId_fkey" FOREIGN KEY ("rubriqueId") REFERENCES "RubriqueFinanciere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifRubrique" ADD CONSTRAINT "TarifRubrique_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "CategorieTarifaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;
