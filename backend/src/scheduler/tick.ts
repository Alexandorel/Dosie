import { prisma } from "../db.js";
import { callQueue } from "../queue/callQueue.js";

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function nowInZone(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  return {
    weekday: weekdayMap[map.weekday],
    hour: Number(map.hour),
    minute: Number(map.minute),
    dateKey: `${map.year}-${map.month}-${map.day}`,
  };
}

export async function runSchedulerTick(now = new Date()) {
  const schedules = await prisma.schedule.findMany({
    where: { active: true },
    include: { patient: true },
  });

  let enqueued = 0;

  for (const schedule of schedules) {
    const { weekday, hour, minute, dateKey } = nowInZone(now, schedule.patient.timezone);

    if (!schedule.daysOfWeek.includes(weekday)) continue;
    if (schedule.timeOfDay.getUTCHours() !== hour) continue;
    if (schedule.timeOfDay.getUTCMinutes() !== minute) continue;

    await callQueue.add(
      "call",
      { patientId: schedule.patientId, scheduleId: schedule.id },
      { jobId: `${schedule.id}:${dateKey}:${hour}:${minute}` },
    );
    enqueued++;
  }

  return enqueued;
}
