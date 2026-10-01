import { prisma } from "../db.js";

export type AlertSeverity = "info" | "warning" | "critical";

interface CreateAlertInput {
  patientId: string;
  severity: AlertSeverity;
  message: string;
  callId?: string;
}

export async function createAlert(input: CreateAlertInput) {
  const alert = await prisma.alert.create({
    data: {
      patientId: input.patientId,
      severity: input.severity,
      message: input.message,
      callId: input.callId ?? null,
    },
  });


  return alert;
}