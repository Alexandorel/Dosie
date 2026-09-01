import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getOwnedPatient } from "../lib/patients.js";

export const schedulesRouter = Router({ mergeParams: true });

schedulesRouter.use(requireAuth);

schedulesRouter.use(async (req, res, next) => {
  const { patientId } = req.params as { patientId: string };
  const patient = await getOwnedPatient(req.userId!, patientId);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  next();
});

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createScheduleSchema = z.object({
  timeOfDay: z.string().regex(timeRegex, "Expected HH:MM"),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
  active: z.boolean().optional(),
  medicationIds: z.array(z.string().uuid()).optional(),
});

const updateScheduleSchema = createScheduleSchema.partial();

function timeToDate(hhmm: string) {
  return new Date(`1970-01-01T${hhmm}:00.000Z`);
}

function getSchedule(patientId: string, id: string) {
  return prisma.schedule.findFirst({ where: { id, patientId } });
}

async function medsBelongToPatient(patientId: string, ids: string[]) {
  if (ids.length === 0) return true;
  const count = await prisma.medication.count({ where: { id: { in: ids }, patientId } });
  return count === ids.length;
}

const scheduleInclude = { medications: { include: { medication: true } } } as const;

schedulesRouter.post<{ patientId: string }>("/", async (req, res) => {
  const parsed = createScheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const { patientId } = req.params;
  const { timeOfDay, daysOfWeek, active, medicationIds = [] } = parsed.data;

  if (!(await medsBelongToPatient(patientId, medicationIds))) {
    return res.status(400).json({ error: "One or more medications do not belong to this patient" });
  }

  const schedule = await prisma.schedule.create({
    data: {
      patientId,
      timeOfDay: timeToDate(timeOfDay),
      daysOfWeek,
      active,
      medications: { create: medicationIds.map((medicationId) => ({ medicationId })) },
    },
    include: scheduleInclude,
  });

  return res.status(201).json({ schedule });
});

schedulesRouter.get<{ patientId: string }>("/", async (req, res) => {
  const schedules = await prisma.schedule.findMany({
    where: { patientId: req.params.patientId },
    orderBy: { timeOfDay: "asc" },
    include: scheduleInclude,
  });

  return res.json({ schedules });
});

schedulesRouter.get<{ patientId: string; id: string }>("/:id", async (req, res) => {
  const schedule = await getSchedule(req.params.patientId, req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  const full = await prisma.schedule.findUnique({ where: { id: schedule.id }, include: scheduleInclude });
  return res.json({ schedule: full });
});

schedulesRouter.patch<{ patientId: string; id: string }>("/:id", async (req, res) => {
  const parsed = updateScheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const existing = await getSchedule(req.params.patientId, req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  const { timeOfDay, daysOfWeek, active, medicationIds } = parsed.data;

  if (medicationIds && !(await medsBelongToPatient(req.params.patientId, medicationIds))) {
    return res.status(400).json({ error: "One or more medications do not belong to this patient" });
  }

  const schedule = await prisma.$transaction(async (tx) => {
    await tx.schedule.update({
      where: { id: existing.id },
      data: {
        ...(timeOfDay !== undefined && { timeOfDay: timeToDate(timeOfDay) }),
        ...(daysOfWeek !== undefined && { daysOfWeek }),
        ...(active !== undefined && { active }),
      },
    });

    if (medicationIds !== undefined) {
      await tx.scheduleMedication.deleteMany({ where: { scheduleId: existing.id } });
      await tx.scheduleMedication.createMany({
        data: medicationIds.map((medicationId) => ({ scheduleId: existing.id, medicationId })),
      });
    }

    return tx.schedule.findUnique({ where: { id: existing.id }, include: scheduleInclude });
  });

  return res.json({ schedule });
});

schedulesRouter.delete<{ patientId: string; id: string }>("/:id", async (req, res) => {
  const existing = await getSchedule(req.params.patientId, req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  await prisma.schedule.delete({ where: { id: existing.id } });

  return res.status(204).send();
});
