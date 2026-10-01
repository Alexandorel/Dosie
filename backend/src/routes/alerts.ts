import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getOwnedPatient } from "../lib/patients.js";

export const alertsRouter = Router({ mergeParams: true });

alertsRouter.use(requireAuth);

// Check if the logged-in caregiver owns the patient.
alertsRouter.use(async (req, res, next) => {
  const { patientId } = req.params as { patientId: string };
  const patient = await getOwnedPatient(req.userId!, patientId);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  next();
});

function getAlert(patientId: string, id: string) {
  return prisma.alert.findFirst({ where: { id, patientId } });
}

// Patient's alerts
alertsRouter.get<{ patientId: string }>("/", async (req, res) => {
  const alerts = await prisma.alert.findMany({
    where: { patientId: req.params.patientId },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ alerts });
});

// Mark alert as aknowledged
alertsRouter.patch<{ patientId: string; id: string }>("/:id/acknowledge", async (req, res) => {
  const existing = await getAlert(req.params.patientId, req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Alert not found" });
  }

  const alert = await prisma.alert.update({
    where: { id: existing.id },
    data: { acknowledged: true },
  });

  return res.json({ alert });
});