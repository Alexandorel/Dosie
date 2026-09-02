import { Queue } from "bullmq";
import { connection } from "./connection.js";

export const CALL_QUEUE_NAME = "calls";

export interface CallJobData {
  patientId: string;
  scheduleId: string;
}

export const callQueue = new Queue<CallJobData>(CALL_QUEUE_NAME, { connection });
