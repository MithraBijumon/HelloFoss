-- CreateTable
CREATE TABLE "MentorAnnouncement" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorAnnouncement_projectSlug_idx" ON "MentorAnnouncement"("projectSlug");

-- AddForeignKey
ALTER TABLE "MentorAnnouncement" ADD CONSTRAINT "MentorAnnouncement_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
