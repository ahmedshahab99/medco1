-- CreateTable
CREATE TABLE "ClinicAvailability" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
    "exceptions" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClinicAvailability_tenantId_key" ON "ClinicAvailability"("tenantId");

-- AddForeignKey
ALTER TABLE "ClinicAvailability" ADD CONSTRAINT "ClinicAvailability_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
