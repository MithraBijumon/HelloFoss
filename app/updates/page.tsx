import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { FormattedText } from "@/components/ui/FormattedText";
import { ActivityList } from "@/components/activity/ActivityList";
import { getPublishedAnnouncements } from "@/lib/announcements";
import { getProjects } from "@/lib/projects";
import { getActivityAcrossProjects } from "@/lib/github";

export const metadata: Metadata = {
  title: "Updates",
  description: "What's new on Hello FOSS and recent activity across project repositories.",
};

const timeFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function UpdatesPage() {
  const [announcements, projects] = await Promise.all([getPublishedAnnouncements(), getProjects()]);
  const activity = await getActivityAcrossProjects(projects);

  return (
    <>
      <PageHero
        eyebrow="What's New"
        title="Updates"
        description="New things on Hello FOSS, plus recent commits, pull requests, and issues across project repositories."
      />

      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">Site announcements</h2>
          {announcements.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
              Nothing posted yet. Check back soon.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs text-muted-subtle">{timeFormat.format(new Date(a.createdAt))}</p>
                  <h3 className="mt-1 font-semibold">{a.title}</h3>
                  <FormattedText text={a.body} className="mt-2 flex flex-col gap-3 text-sm leading-relaxed text-muted" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold">Project activity</h2>
          <div className="mt-4 rounded-lg border border-border bg-card p-5">
            <ActivityList
              items={activity}
              emptyLabel="No recent repository activity found across published projects."
            />
          </div>
        </section>
      </Container>
    </>
  );
}
