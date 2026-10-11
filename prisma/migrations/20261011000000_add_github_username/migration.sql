-- AlterTable
ALTER TABLE "User" ADD COLUMN "githubUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");
