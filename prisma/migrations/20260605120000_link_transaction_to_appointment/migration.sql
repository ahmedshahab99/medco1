-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "appointmentId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_appointmentId_idx" ON "Transaction"("appointmentId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
