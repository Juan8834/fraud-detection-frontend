/* ======================
   Employee
===================== */
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

/* ======================
   Customer
===================== */
export interface Customer {
  id: number;
  name: string;
  email?: string | null;
}

/* ======================
   Transaction Item (FLATTENED FROM BACKEND)
===================== */
export interface TransactionItem {
  id: number;
  itemId: number;
  name: string;        // ✅ backend sends this
  quantity: number;
  unitPrice: number;
  total: number;
  shrinkRisk?: number;
}

/* ======================
   Case Management
===================== */
export type CaseStatus = "OPEN" | "PENDING" | "CLOSED";

/* ======================
   Transaction (FRONTEND SHAPE)
===================== */
export interface Transaction {
  id: number;
  createdAt: string;

  employee: Employee;
  customer?: Customer | null;

  totalAmount: number;

  /** ✅ FRIENDLY STRING FROM BACKEND */
  type: "Purchase" | "Refund" | "Exchange" | "Void" | "No Sale" | "Unknown";

  /** Fraud & risk */
  isFraud: boolean;
  riskScore?: number | null;
  fraudType?: string | null;
  fraudExplanation?: string | null;

  /** Items */
  items: TransactionItem[];

  /** Case management */
  caseStatus?: CaseStatus;
  caseNotes?: string[];
  lastUpdated?: string;
}
