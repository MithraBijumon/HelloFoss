"use client";

import { useEffect, useState } from "react";
import { MentorAnnouncementList } from "@/components/mentor/MentorAnnouncementList";
import { useAuth } from "@/lib/auth-context";
import type { MentorAnnouncement } from "@/lib/mentor-announcements";

/** Mentor broadcasts for a project; renders nothing unless the viewer is registered (or a mentor/admin). */
export function ProjectMentorAnnouncements({ projectSlug }: { projectSlug: string }) {
  const { user, registrations } = useAuth();
  const [items, setItems] = useState<MentorAnnouncement[]>([]);
  const registered = registrations.includes(projectSlug);
  const eligible = Boolean(user) && (registered || user?.role === "MENTOR" || user?.role === "ADMIN");

  useEffect(() => {
    if (!eligible) return;
    let cancelled = false;
    fetch(`/api/projects/${projectSlug}/announcements`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.announcements)) setItems(data.announcements);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [eligible, projectSlug]);

  if (!eligible || items.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold">Announcements from mentors</h2>
      <div className="mt-3">
        <MentorAnnouncementList items={items} />
      </div>
    </div>
  );
}
