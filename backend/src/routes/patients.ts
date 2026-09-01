import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getOwnedPatient } from "../lib/patients.js";
import { medicationsRouter } from "./medications.js";
import { schedulesRouter } from "./schedules.js";

export const patientsRouter = Router();

patientsRouter.use(requireAuth);

const createPatientSchema = z.object({
  fullName: z.string().min(1),
  phoneNumber: z.string().min(1),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

patientsRouter.use("/:patientId/medications", medicationsRouter);
patientsRouter.use("/:patientId/schedules", schedulesRouter);

patientsRouter.post("/", async (req, res) => {
  const parsed = createPatientSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const patient = await prisma.patient.create({
    data: {
      ...parsed.data,
      caregivers: {
        create: { userId: req.userId!, role: "owner" },
      },
    },
  });

  return res.status(201).json({ patient });
});

patientsRouter.get("/", async (req, res) => {
  const patients = await prisma.patient.findMany({
    where: { caregivers: { some: { userId: req.userId! } } },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ patients });
});

patientsRouter.get("/:id", async (req, res) => {
  const patient = await getOwnedPatient(req.userId!, req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  return res.json({ patient });
});

patientsRouter.patch("/:id", async (req, res) => {
  const parsed = updatePatientSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const existing = await getOwnedPatient(req.userId!, req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Patient not found" });
  }

  const patient = await prisma.patient.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  return res.json({ patient });
});

patientsRouter.delete("/:id", async (req, res) => {
  const existing = await getOwnedPatient(req.userId!, req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Patient not found" });
  }

  await prisma.patient.delete({ where: { id: req.params.id } });

  return res.status(204).send();
});
