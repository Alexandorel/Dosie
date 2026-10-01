import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// Aggregated summary for the logged-in caregiver, across all their patients.
dashboardRouter.get("/", async (req, res) => {
  const userId = req.userId!;

  // The patients this caregiver is linked to.
  const patients = await prisma.patient.findMany({
    where: { caregivers: { some: { userId } } },
    select: { id: true },
  });
  const patientIds = patients.map((p) => p.id);

  if (patientIds.length === 0) {
    return res.json({
      patientsCount: 0,
      openAlertsCount: 0,
      activeSchedulesCount: 0,
      recentAlerts: [],
    });
  }

  const [openAlertsCount, activeSchedulesCount, recentAlerts] = await Promise.all([
    prisma.alert.count({
      where: { patientId: { in: patientIds }, acknowledged: false },
    }),
    prisma.schedule.count({
      where: { patientId: { in: patientIds }, active: true },
    }),
    prisma.alert.findMany({
      where: { patientId: { in: patientIds }, acknowledged: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { patient: { select: { fullName: true } } },
    }),
  ]);

  return res.json({
    patientsCount: patientIds.length,
    openAlertsCount,
    activeSchedulesCount,
    recentAlerts: recentAlerts.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      patientName: a.patient.fullName,
      severity: a.severity,
      message: a.message,
      createdAt: a.createdAt,
    })),
  });
});