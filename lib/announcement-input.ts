export type AnnouncementInput = {
  title: string;
  body: string;
  published: boolean;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Validates the admin announcement form. Throws an Error with a user-facing message. */
export function parseAnnouncementInput(body: unknown): AnnouncementInput {
  const b = (body ?? {}) as Record<string, unknown>;

  const title = str(b.title);
  if (!title) throw new Error("Enter a title.");
  if (title.length > 150) throw new Error("Keep the title under 150 characters.");

  const text = str(b.body);
  if (!text) throw new Error("Enter the announcement body.");
  if (text.length > 5000) throw new Error("Keep the body under 5,000 characters.");

  return { title, body: text, published: b.published !== false };
}
