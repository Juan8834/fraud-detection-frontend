import React from "react";
import type { Transaction } from "../types/transaction";

interface Props {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

const TransactionTable: React.FC<Props> = ({
  transactions,
  onSelectTransaction,
}) => {
  const typeColorMap: Record<string, string> = {
    Purchase: "bg-green-500",
    Refund: "bg-yellow-500",
    Exchange: "bg-blue-500",
    Void: "bg-gray-500",
    "No Sale": "bg-gray-400",
    Fraud: "bg-red-600",
    Unknown: "bg-gray-500",
  };

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2 text-left">ID</th>
          <th className="border p-2 text-left">Employee</th>
          <th className="border p-2 text-left">Amount</th>
          <th className="border p-2 text-left">Risk Score</th>
          <th className="border p-2 text-left">Type</th>
        </tr>
      </thead>

      <tbody>
        {transactions.map((tx) => {
          const typeLabel = tx.type ?? "Unknown";
          const typeBgClass = typeColorMap[typeLabel] ?? "bg-gray-500";

          let riskBgClass = "bg-green-200 text-green-800";
          if (tx.riskScore != null) {
            if (tx.riskScore >= 75) riskBgClass = "bg-red-200 text-red-800";
            else if (tx.riskScore >= 40)
              riskBgClass = "bg-yellow-200 text-yellow-800";
          }

          const employee = tx.employee as any;

          const flagReasons: string[] = [];
          if (tx.riskScore != null && tx.riskScore >= 75)
            flagReasons.push("High risk score (≥ 75)");
          if (tx.isFraud) flagReasons.push("Marked as fraud");

          return (
            <tr
              key={tx.id}
              className="even:bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              onClick={() => onSelectTransaction(tx)}
            >
              <td className="border p-2">{tx.id}</td>

              <td className="border p-2">
                {employee ? (
                  <div className="flex flex-col">
                    <span>
                      {employee.firstName} {employee.lastName}
                    </span>

                    <div className="flex gap-2 mt-1">
                      {employee.isFlagged && (
                        <div
                          className="relative group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="px-2 py-0.5 text-xs rounded bg-red-600 text-white cursor-help">
                            Flagged
                          </span>

                          {/* Tooltip */}
                          <div className="absolute z-50 hidden group-hover:block w-max max-w-xs bg-black text-white text-xs rounded px-2 py-1 mt-1">
                            {flagReasons.length > 0
                              ? flagReasons.join(" • ")
                              : "Employee flagged for suspicious activity"}
                          </div>
                        </div>
                      )}

                      {typeof employee.flaggedCount === "number" && (
                        <span className="px-2 py-0.5 text-xs rounded bg-gray-300 text-gray-800">
                          Flags: {employee.flaggedCount}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  "—"
                )}
              </td>

              <td className="border p-2">
                ${tx.totalAmount.toFixed(2)}
              </td>

              <td className="border p-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${riskBgClass}`}
                >
                  {tx.riskScore != null ? tx.riskScore.toFixed(1) : "—"}
                </span>
              </td>

              <td className="border p-2">
                <span
                  className={`px-2 py-1 text-white text-xs font-semibold rounded ${typeBgClass}`}
                >
                  {typeLabel}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TransactionTable;
