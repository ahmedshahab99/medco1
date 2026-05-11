/*
  Warnings:

  - You are about to drop the column `firstName` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `Waitlist` table. All the data in the column will be lost.
  - Made the column `patientId` on table `Waitlist` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Waitlist" DROP CONSTRAINT "Waitlist_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Waitlist" DROP CONSTRAINT "Waitlist_serviceId_fkey";

-- AlterTable
ALTER TABLE "Waitlist" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone",
DROP COLUMN "serviceId",
ALTER COLUMN "patientId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
