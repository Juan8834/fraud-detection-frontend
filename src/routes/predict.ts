import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { amount, merchant, location } = req.body;
  // Mock prediction
  const riskScore = Math.floor(Math.random() * 100);
  res.json({ riskScore, amount, merchant, location });
});

export default router;
