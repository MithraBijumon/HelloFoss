export type CoordinatorInput = {
  email: string;
  name: string | null;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Validates the admin "add coordinator" form. Throws an Error with a user-facing message. */
export function parseCoordinatorInput(body: unknown): CoordinatorInput {
  const b = (body ?? {}) as Record<string, unknown>;

  const email = str(b.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const name = str(b.name) || null;
  if (name && name.length > 100) throw new Error("Keep the name under 100 characters.");

  return { email, name };
}
