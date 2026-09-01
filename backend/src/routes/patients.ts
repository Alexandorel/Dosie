import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const patientsRouter = Router();

patientsRouter.use(requireAuth);

const createPatientSchema = z.object({
  fullName: z.string().min(1),
  phoneNumber: z.string().min(1),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

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
  const patient = await prisma.patient.findFirst({
    where: {
      id: req.params.id,
      caregivers: { some: { userId: req.userId! } },
    },
  });

  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  return res.json({ patient });
});
