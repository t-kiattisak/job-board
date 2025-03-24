-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "selectedUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_selectedUserId_fkey" FOREIGN KEY ("selectedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
