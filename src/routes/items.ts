import { Router } from "express";

const router = Router();

// GET /items - fetch all items
router.get("/", async (_req, res) => {
  try {
    const items = await fetchItemsFromDB();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

export default router;

// Mock DB function
async function fetchItemsFromDB() {
  return [
    { id: 39, name: "Laptop", price: 1200, stock: 10, shrinkRisk: 0, createdAt: new Date().toISOString() },
    { id: 40, name: "Smartphone", price: 800, stock: 15, shrinkRisk: 0, createdAt: new Date().toISOString() },
    { id: 41, name: "Headphones", price: 150, stock: 20, shrinkRisk: 0, createdAt: new Date().toISOString() },
    { id: 42, name: "Monitor", price: 300, stock: 5, shrinkRisk: 0, createdAt: new Date().toISOString() },
    { id: 43, name: "Keyboard", price: 100, stock: 12, shrinkRisk: 0, createdAt: new Date().toISOString() },
    { id: 44, name: "Mouse", price: 50, stock: 18, shrinkRisk: 0, createdAt: new Date().toISOString() },
  ];
}
