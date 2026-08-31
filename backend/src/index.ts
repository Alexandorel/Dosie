import express from "express";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dosie-backend" });
});

app.use("/auth", authRouter);

app.listen(config.port, () => {
  console.log(`Dosie backend running on http://localhost:${config.port}`);
});
