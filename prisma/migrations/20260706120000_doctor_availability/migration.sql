/*
  Warnings:

  - You are about to drop the `ClinicAvailability` table, which is not empty.
    Its schedule/settings data is backfilled below into one `DoctorAvailability`
    row per existing DOCTOR/ADMIN profile before the table is dropped.

*/

-- CreateTable
CREATE TABLE "DoctorAvailability" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id")
);

-- Backfill: copy each tenant's clinic-wide schedule + settings to every
-- bookable (DOCTOR/ADMIN, non-deleted, tenanted) profile, so no existing
-- clinic configuration is lost when the ClinicAvailability table is dropped.
INSERT INTO "DoctorAvailability" ("id", "tenantId", "doctorId", "schedule", "settings", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    p."tenantId",
    p."id",
    c."schedule",
    c."settings",
    NOW(),
    NOW()
FROM "Profile" p
JOIN "ClinicAvailability" c ON c."tenantId" = p."tenantId"
WHERE p."role" IN ('DOCTOR', 'ADMIN')
  AND p."deletedAt" IS NULL
  AND p."tenantId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DoctorAvailability_doctorId_key" ON "DoctorAvailability"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorAvailability_tenantId_idx" ON "DoctorAvailability"("tenantId");

-- AddForeignKey
ALTER TABLE "DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "ClinicAvailability" DROP CONSTRAINT "ClinicAvailability_tenantId_fkey";

-- DropIndex
DROP INDEX "ClinicAvailability_tenantId_key";

-- DropTable
DROP TABLE "ClinicAvailability";
