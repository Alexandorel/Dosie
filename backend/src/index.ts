import express from "express";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { patientsRouter } from "./routes/patients.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { startScheduler } from "./scheduler/index.js";
import { startCallWorker } from "./queue/callWorker.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dosie-backend" });
});

app.use("/auth", authRouter);
app.use("/patients", patientsRouter);
app.use("/dashboard", dashboardRouter);

app.listen(config.port, async () => {
  console.log(`Dosie backend running on http://localhost:${config.port}`);

  startCallWorker();
  await startScheduler();
  console.log("Scheduler and call worker started");
});
