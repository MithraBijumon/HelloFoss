import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { MessagesPanel } from "@/components/messages/MessagesPanel";
import { getMentorSession, getMentorProjects } from "@/lib/mentor";
import { getConversationsForViewer } from "@/lib/messages";

export const metadata: Metadata = {
  title: "Mentor dashboard",
  robots: { index: false, follow: false },
};

export default async function MentorPage() {
  const session = await getMentorSession();
  // Non-mentors get a plain 404 so the page's existence isn't advertised.
  if (!session || !session.mentorId) notFound();

  const [projects, conversations] = await Promise.all([
    getMentorProjects(session.mentorId),
    getConversationsForViewer(session),
  ]);

  return (
    <Container className="py-12 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Mentor</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Your projects</h2>
        {projects.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
            You&apos;re not listed as a mentor on any project yet.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            {projects.map((p) => (
              <div key={p.slug} className="rounded-lg border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <Badge variant={p.track === "Advanced" ? "accent" : "default"}>{p.track}</Badge>
                  {!p.published && <Badge>Hidden</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted-subtle">
                  {p.students.length} student{p.students.length === 1 ? "" : "s"} registered
                </p>

                {p.students.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-md border border-border">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-background">
                        <tr className="border-b border-border font-mono text-xs uppercase tracking-widest text-muted-subtle">
                          <th className="px-4 py-2 font-normal">Student</th>
                          <th className="px-4 py-2 font-normal">IIT</th>
                          <th className="px-4 py-2 font-normal">Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.students.map((s) => (
                          <tr key={s.id} className="border-b border-border last:border-b-0">
                            <td className="px-4 py-2">
                              <span className="font-medium">{s.name || s.email}</span>
                              <span className="block text-xs text-muted-subtle">{s.email}</span>
                            </td>
                            <td className="px-4 py-2 text-muted">{s.iit ?? "—"}</td>
                            <td className="px-4 py-2 text-muted">
                              {new Date(s.registeredAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Messages</h2>
        <div className="mt-4">
          <MessagesPanel
            initialConversations={conversations}
            emptyTitle="No messages yet"
            emptyDescription="When a student messages you about one of your projects, it'll show up here."
          />
        </div>
      </section>
    </Container>
  );
}
