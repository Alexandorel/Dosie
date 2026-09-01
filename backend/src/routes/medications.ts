import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getOwnedPatient } from "../lib/patients.js";

export const medicationsRouter = Router({ mergeParams: true });

medicationsRouter.use(requireAuth);

medicationsRouter.use(async (req, res, next) => {
  const { patientId } = req.params as { patientId: string };
  const patient = await getOwnedPatient(req.userId!, patientId);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  next();
});

const createMedicationSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.enum(["mg", "ml", "pill", "drop", "sachet", "puff"]),
  form: z.enum(["syrup", "tablet", "drops", "inhaler", "capsule"]).optional(),
  instructions: z.string().optional(),
  active: z.boolean().optional(),
});

const updateMedicationSchema = createMedicationSchema.partial();

function getMedication(patientId: string, id: string) {
  return prisma.medication.findFirst({ where: { id, patientId } });
}

medicationsRouter.post<{ patientId: string }>("/", async (req, res) => {
  const parsed = createMedicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const medication = await prisma.medication.create({
    data: { ...parsed.data, patientId: req.params.patientId },
  });

  return res.status(201).json({ medication });
});

medicationsRouter.get<{ patientId: string }>("/", async (req, res) => {
  const medications = await prisma.medication.findMany({
    where: { patientId: req.params.patientId },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ medications });
});

medicationsRouter.get<{ patientId: string; id: string }>("/:id", async (req, res) => {
  const medication = await getMedication(req.params.patientId, req.params.id);
  if (!medication) {
    return res.status(404).json({ error: "Medication not found" });
  }

  return res.json({ medication });
});

medicationsRouter.patch<{ patientId: string; id: string }>("/:id", async (req, res) => {
  const parsed = updateMedicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const existing = await getMedication(req.params.patientId, req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Medication not found" });
  }

  const medication = await prisma.medication.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  return res.json({ medication });
});

medicationsRouter.delete<{ patientId: string; id: string }>("/:id", async (req, res) => {
  const existing = await getMedication(req.params.patientId, req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Medication not found" });
  }

  await prisma.medication.delete({ where: { id: req.params.id } });

  return res.status(204).send();
});
