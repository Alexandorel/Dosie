import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dosie-backend" });
});

app.listen(PORT, () => {
  console.log(`Dosie backend running on http://localhost:${PORT}`);
});
