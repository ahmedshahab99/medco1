-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_tenantId_fkey";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "tenantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
