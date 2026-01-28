import { Router } from "express";

const router = Router();

/* ======================
   MOCK DATABASE
====================== */

let transactions = await fetchTransactionsFromDB();

/* ======================
   GET /transactions
====================== */
router.get("/", async (_req, res) => {
  try {
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

/* ======================
   PATCH /transactions/:id/case
   Update case status + notes
====================== */
router.patch("/:id/case", (req, res) => {
  const transactionId = Number(req.params.id);
  const { caseStatus, caseNotes } = req.body;

  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  transaction.caseStatus = caseStatus;
  transaction.caseNotes = caseNotes;
  transaction.lastUpdated = new Date().toISOString();

  res.json(transaction);
});

export default router;

/* ======================
   MOCK DB FETCH
====================== */
async function fetchTransactionsFromDB() {
  const employees = [
    {
      id: 30,
      firstName: "Bob",
      lastName: "Johnson",
      role: "Cashier",
      email: "bob.johnson@example.com",
      storeId: 4,
      suspicionScore: 0,
      flaggedCount: 0,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 31,
      firstName: "Alice",
      lastName: "Smith",
      role: "Manager",
      email: "alice.smith@example.com",
      storeId: 4,
      suspicionScore: 0,
      flaggedCount: 0,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 32,
      firstName: "John",
      lastName: "Doe",
      role: "Cashier",
      email: "john.doe@example.com",
      storeId: 5,
      suspicionScore: 0,
      flaggedCount: 0,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 33,
      firstName: "Jane",
      lastName: "Roe",
      role: "Manager",
      email: "jane.roe@example.com",
      storeId: 5,
      suspicionScore: 0,
      flaggedCount: 0,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    },
  ];

  return [
    {
      id: 193,
      employeeId: 30,
      employee: employees[0],
      items: [
        {
          id: 10,
          quantity: 1,
          unitPrice: 1200,
          item: { id: 39, name: "Laptop", price: 1200 },
        },
      ],
      totalAmount: 1200,
      riskScore: 98,
      type: "fraud",
      fraudType: "Suspicious Refund Pattern",
      fraudExplanation: "Customer has multiple refunds flagged in 30 days.",
      caseStatus: "open",
      caseNotes: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 192,
      employeeId: 33,
      employee: employees[3],
      items: [
        {
          id: 8,
          quantity: 2,
          unitPrice: 100,
          item: { id: 43, name: "Keyboard", price: 100 },
        },
        {
          id: 9,
          quantity: 1,
          unitPrice: 50,
          item: { id: 44, name: "Mouse", price: 50 },
        },
      ],
      totalAmount: 350,
      riskScore: null,
      type: "purchase",
      caseStatus: "cleared",
      caseNotes: [],
      lastUpdated: new Date().toISOString(),
    },
  ];
}
