import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SignInButton } from "@/components/auth/SignInButton";
import { MessagesPanel } from "@/components/messages/MessagesPanel";
import { getSession } from "@/lib/auth";
import { MentorAnnouncementList } from "@/components/mentor/MentorAnnouncementList";
import { getConversationsForViewer } from "@/lib/messages";
import { getMentorAnnouncementsForStudent } from "@/lib/mentor-announcements";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const session = await getSession();

  if (!session) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="max-w-sm text-sm text-muted">
          Sign in to message project mentors and see your conversations.
        </p>
        <SignInButton />
      </Container>
    );
  }

  const [conversations, announcements] = await Promise.all([
    getConversationsForViewer(session),
    getMentorAnnouncementsForStudent(session.id),
  ]);
  const isMentor = session.role === "MENTOR" && Boolean(session.mentorId);

  return (
    <Container className="py-12 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Messages</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {isMentor ? "Student conversations" : "Your conversations"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isMentor
          ? "Messages students have sent you about your projects."
          : "Messages you've sent to project mentors."}
      </p>

      {announcements.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Announcements from your mentors</h2>
          <div className="mt-3">
            <MentorAnnouncementList items={announcements} showProject />
          </div>
        </section>
      )}

      <div className="mt-8">
        <MessagesPanel
          initialConversations={conversations}
          emptyTitle="No messages yet"
          emptyDescription={
            isMentor
              ? "When a student messages you about one of your projects, it'll show up here."
              : "Message a project's mentor from its project page to start a conversation."
          }
        />
      </div>
    </Container>
  );
}
