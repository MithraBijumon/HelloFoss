import { NextResponse } from "next/server";
import { getDashboardSession, getAdminUsers } from "@/lib/admin";

function csvCell(value: string): string {
  // Prefix formula-like values so spreadsheets don't execute user-supplied names.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET() {
  if (!(await getDashboardSession())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const users = await getAdminUsers();
  const header = ["Name", "Email", "Role", "IIT", "Verified", "Projects", "Signed up"];
  const rows = users.map((u) => [
    u.name ?? "",
    u.email,
    u.role,
    u.iit ?? "",
    u.verified ? "yes" : "no",
    u.projects.map((p) => p.name).join("; "),
    u.createdAt,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hellofoss-users-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
