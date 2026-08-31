import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { hashPassword } from "../lib/password.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  phoneNumber: z.string().optional(),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const { email, password, fullName, phoneNumber } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, phoneNumber },
    select: { id: true, email: true, fullName: true, createdAt: true },
  });

  return res.status(201).json({ user });
});
