import React, { useState } from "react";
import type { Transaction } from "../types/transaction";
import CaseStatusBadge from "./CaseStatusBadge";

type BackendCaseStatus = "OPEN" | "PENDING" | "CLOSED";

const STATUS_OPTIONS: Record<BackendCaseStatus, string> = {
  OPEN: "Open",
  PENDING: "Investigating",
  CLOSED: "Cleared",
};

// Badge colors for backend-friendly type labels
const TYPE_COLOR_MAP: Record<string, string> = {
  Purchase: "bg-green-500",
  Refund: "bg-yellow-500",
  Exchange: "bg-blue-500",
  Void: "bg-gray-500",
  "No Sale": "bg-gray-400",
  Fraud: "bg-red-600",
  Unknown: "bg-gray-500",
};

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetails: React.FC<Props> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const items = transaction.items ?? [];
  const riskScore = transaction.riskScore ?? 0;

  const [status, setStatus] = useState<BackendCaseStatus>(
    (transaction.caseStatus as BackendCaseStatus) ?? "OPEN"
  );
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>(transaction.caseNotes ?? []);
  const [saving, setSaving] = useState(false);

  const saveCaseUpdate = async () => {
    if (!transaction) return;

    const updatedNotes = note.trim() ? [...notes, note] : [...notes];
    setSaving(true);

    try {
      const res = await fetch(
        `http://localhost:5000/transactions/${transaction.id}/case`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseStatus: status,
            caseNotes: updatedNotes,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save case update");

      const updatedTx = await res.json();
      setNotes(updatedTx.caseNotes ?? []);
      setNote("");
    } catch (err) {
      console.error(err);
      alert("Error saving case update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Fraud ALWAYS overrides type color
  const typeLabel = transaction.isFraud
    ? "Fraud"
    : transaction.type ?? "Unknown";

  const typeBgClass =
    TYPE_COLOR_MAP[typeLabel] ?? TYPE_COLOR_MAP.Unknown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-auto">
        <h2 className="mb-4 text-xl font-semibold">Transaction Details</h2>

        {/* BASIC INFO */}
        <div className="space-y-2 text-sm">
          <p><strong>ID:</strong> {transaction.id}</p>

          <p>
            <strong>Employee:</strong>{" "}
            {transaction.employee
              ? `${transaction.employee.firstName} ${transaction.employee.lastName}`
              : "—"}
          </p>

          <p><strong>Amount:</strong> ${transaction.totalAmount.toFixed(2)}</p>

          <p>
            <strong>Risk:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                riskScore >= 75
                  ? "bg-red-600"
                  : riskScore >= 40
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            >
              {riskScore}
            </span>
          </p>

          <p>
            <strong>Type:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-white text-xs font-semibold ${typeBgClass}`}
            >
              {typeLabel}
            </span>
          </p>

          <p>
            <strong>Case Status:</strong>{" "}
            <CaseStatusBadge status={status} />
          </p>

          {transaction.fraudExplanation && (
            <p className="text-red-600">
              <strong>Fraud Explanation:</strong>{" "}
              {transaction.fraudExplanation}
            </p>
          )}
        </div>

        {/* ITEMS TABLE */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Items</h3>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No items recorded.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-1">Item</th>
                  <th className="text-left py-1">Qty</th>
                  <th className="text-left py-1">Unit</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b last:border-b-0">
                    <td className="py-1">{it.name}</td>
                    <td className="py-1">{it.quantity}</td>
                    <td className="py-1">${it.unitPrice.toFixed(2)}</td>
                    <td className="py-1 text-right">
                      ${it.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* CASE MANAGEMENT */}
        <div className="mt-6 bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Case Management</h3>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as BackendCaseStatus)
            }
            className="border rounded p-2 mb-2 w-full"
          >
            {Object.entries(STATUS_OPTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <textarea
            className="border rounded p-2 w-full mb-2"
            placeholder="Add investigation note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            onClick={saveCaseUpdate}
            disabled={saving}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Saving..." : "Save Case Update"}
          </button>

          {notes.length > 0 && (
            <ul className="mt-4 space-y-2">
              {notes.map((n, i) => (
                <li key={i} className="text-sm bg-white p-2 rounded shadow">
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
