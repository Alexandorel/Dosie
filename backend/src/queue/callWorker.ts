import { Worker } from "bullmq";
import { prisma } from "../db.js";
import { connection } from "./connection.js";
import { CALL_QUEUE_NAME, type CallJobData } from "./callQueue.js";

export function startCallWorker() {
  const worker = new Worker<CallJobData>(
    CALL_QUEUE_NAME,
    async (job) => {
      const { patientId, scheduleId } = job.data;

      // just register the call. Later will be replace by twilio call
      const call = await prisma.call.create({
        data: { patientId, scheduleId, status: "queued" },
      });

      return { callId: call.id };
    },
    { connection },
  );

  worker.on("completed", (job) => {
    console.log(`Call job ${job.id} completed for patient ${job.data.patientId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Call job ${job?.id} failed:`, err.message);
  });

  return worker;
}
