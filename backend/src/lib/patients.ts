import { prisma } from "../db.js";

export function getOwnedPatient(userId: string, id: string) {
  return prisma.patient.findFirst({
    where: { id, caregivers: { some: { userId } } },
  });
}
