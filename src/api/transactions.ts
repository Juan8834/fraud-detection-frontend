import type { Transaction } from "../types/transaction";

const API_URL = "http://localhost:5000";

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_URL}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}
