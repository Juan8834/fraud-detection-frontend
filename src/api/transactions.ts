import type { Transaction } from "../types/transaction";
import { API_URL } from "./config";

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_URL}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}
