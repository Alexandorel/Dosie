import { Queue, Worker } from "bullmq";
import { connection } from "../queue/connection.js";
import { runSchedulerTick } from "./tick.js";

const TICK_QUEUE_NAME = "scheduler";

export async function startScheduler() {
  const queue = new Queue(TICK_QUEUE_NAME, { connection });

  await queue.upsertJobScheduler("dosie-tick", { pattern: "* * * * *" }, { name: "tick" });

  const worker = new Worker(
    TICK_QUEUE_NAME,
    async () => {
      const enqueued = await runSchedulerTick();
      if (enqueued > 0) console.log(`Scheduler tick enqueued ${enqueued} call(s)`);
    },
    { connection },
  );

  worker.on("failed", (_job, err) => {
    console.error("Scheduler tick failed:", err.message);
  });

  return { queue, worker };
}
