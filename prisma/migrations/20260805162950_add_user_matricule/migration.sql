/*
  Warnings:

  - A unique constraint covering the columns `[matricule]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "matricule" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_matricule_key" ON "User"("matricule");
