import { prisma } from "@/lib/db";

/** Used at registration to grant the COORDINATOR role. */
export async function getCoordinatorByEmail(email: string) {
  return prisma.coordinator.findUnique({ where: { email: email.toLowerCase() } });
}
