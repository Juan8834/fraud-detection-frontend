import { Router } from "express";

const router = Router();

interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
}

const employees: Employee[] = [
  { id: 1, name: "Alice Johnson", role: "Manager", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", role: "Cashier", email: "bob@example.com" },
  { id: 3, name: "Charlie Lee", role: "Security", email: "charlie@example.com" },
];

router.get("/", (_req, res) => {
  res.json(employees);
});

export default router;
