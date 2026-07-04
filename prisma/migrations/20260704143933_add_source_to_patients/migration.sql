/*
  Warnings:

  - You are about to drop the column `status` on the `Patient` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PatientSource" AS ENUM ('SOCIAL_MEDIA', 'GOOGLE_MAPS', 'CLINIC_WEBSITE', 'REFERRAL', 'WALK_IN', 'OTHER');

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "status",
ADD COLUMN     "source" "PatientSource";
