import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import type { Transaction } from "../types/transaction";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ======================
   Config
====================== */
const API_URL = "http://localhost:5000";

/* ======================
   Types
====================== */
type CustomerConnection = {
  id: number;
  name: string;
  count: number;
  avgRisk: number;
  anomaly?: string;
};

type EmployeeSummary = {
  id: number;
  name: string;
  totalTransactions: number;
  avgRisk: number;
  customers: CustomerConnection[];
};

type RiskFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

/* ======================
   Component
====================== */
const EmployeesPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<number | null>(null);

  // Search/filter state
  const [searchName, setSearchName] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<RiskFilter>("ALL");
  const [customerSearch, setCustomerSearch] = useState("");

  // Hover state for chart highlighting
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch(`${API_URL}/transactions`);
        const data: Transaction[] = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("❌ Failed to fetch transactions", err);
      }
    }
    fetchTransactions();
  }, []);

  /* ======================
     Build Employee → Customer Relationships
  ====================== */
  const employees: EmployeeSummary[] = useMemo(() => {
    const map = new Map<number, EmployeeSummary & { riskTotal: number }>();

    transactions.forEach((t) => {
      if (!t.employee || !t.customer || t.riskScore == null) return;

      if (!map.has(t.employee.id)) {
        map.set(t.employee.id, {
          id: t.employee.id,
          name: `${t.employee.firstName} ${t.employee.lastName}`,
          totalTransactions: 0,
          avgRisk: 0,
          riskTotal: 0,
          customers: [],
        });
      }

      const emp = map.get(t.employee.id)!;
      emp.totalTransactions += 1;
      emp.riskTotal += t.riskScore;
      emp.avgRisk = emp.riskTotal / emp.totalTransactions;

      let cust = emp.customers.find((c) => c.id === t.customer.id);
      if (!cust) {
        cust = {
          id: t.customer.id,
          name: t.customer.name,
          count: 0,
          avgRisk: 0,
        };
        emp.customers.push(cust);
      }

      cust.count += 1;
      cust.avgRisk =
        (cust.avgRisk * (cust.count - 1) + t.riskScore) / cust.count;
    });

    // Anomaly Detection
    map.forEach((emp) => {
      emp.customers.forEach((c) => {
        if (emp.avgRisk >= 75 && c.avgRisk >= 75) {
          c.anomaly = "Dual High Risk";
        } else if (c.avgRisk >= emp.avgRisk + 20) {
          c.anomaly = "Risk Spike vs Employee";
        } else if (c.count >= 5 && c.avgRisk >= 60) {
          c.anomaly = "Repeated High-Risk Exposure";
        } else {
          c.anomaly = undefined;
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.avgRisk - a.avgRisk);
  }, [transactions]);

  /* ======================
     Filter Employees
  ====================== */
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesName = e.name.toLowerCase().includes(searchName.toLowerCase());

      let matchesRisk = true;
      if (riskLevelFilter === "HIGH") matchesRisk = e.avgRisk >= 75;
      else if (riskLevelFilter === "MEDIUM")
        matchesRisk = e.avgRisk >= 40 && e.avgRisk < 75;
      else if (riskLevelFilter === "LOW") matchesRisk = e.avgRisk < 40;

      return matchesName && matchesRisk;
    });
  }, [employees, searchName, riskLevelFilter]);

  /* ======================
     Summary & Top Risk
  ====================== */
  const summary = useMemo(
    () => ({
      total: employees.length,
      high: employees.filter((e) => e.avgRisk >= 75).length,
      medium: employees.filter((e) => e.avgRisk >= 40 && e.avgRisk < 75).length,
      low: employees.filter((e) => e.avgRisk < 40).length,
    }),
    [employees]
  );

  const topRiskEmployees = useMemo(
    () => filteredEmployees.slice(0, 3),
    [filteredEmployees]
  );

  /* ======================
     Chart Data
  ====================== */
  const chartData = useMemo(
    () =>
      filteredEmployees.map((e) => ({
        name: e.name,
        transactions: e.totalTransactions,
        avgRisk: Number(e.avgRisk.toFixed(1)),
      })),
    [filteredEmployees]
  );

  /* ======================
     Chart Click Handler
  ====================== */
  const handleChartClick = (employeeName: string) => {
    setSearchName(employeeName);
  };

  /* ======================
     UI
  ====================== */
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-4">Employees</h1>

      {/* 🔥 Top Risk Employees */}
      {topRiskEmployees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {topRiskEmployees.map((e) => (
            <div
              key={e.id}
              className="p-4 border border-red-300 bg-red-50 rounded cursor-pointer hover:shadow"
              onClick={() => navigate(`/transactions?employeeId=${e.id}`)}
            >
              <div className="text-sm text-red-700 font-semibold">⚠️ High Risk</div>
              <div className="font-bold">{e.name}</div>
              <div className="text-sm">
                Avg Risk: {e.avgRisk.toFixed(1)} · Transactions: {e.totalTransactions}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Employees" value={summary.total} />
        <SummaryCard label="High Risk" value={summary.high} color="red" />
        <SummaryCard label="Medium Risk" value={summary.medium} color="yellow" />
        <SummaryCard label="Low Risk" value={summary.low} color="green" />
      </div>

      {/* 🔥 Interactive Chart */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="font-semibold mb-4">Employee Activity & Risk</h2>

        {searchName && (
          <button
            onClick={() => setSearchName("")}
            className="text-xs text-blue-600 underline mb-2"
          >
            Clear employee filter
          </button>
        )}

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar
              dataKey="transactions"
              name="Transactions"
              fill="#3b82f6"
              onClick={(data: any) => {
                if (data?.name) handleChartClick(data.name);
              }}
              onMouseEnter={(data: any) => setHoveredEmployee(data?.name || null)}
              onMouseLeave={() => setHoveredEmployee(null)}
            />

            <Line
              type="monotone"
              dataKey="avgRisk"
              name="Avg Risk"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{
                r: 6,
                onClick: (e: any) => {
                  if (e?.payload?.name) handleChartClick(e.payload.name);
                },
                onMouseEnter: (e: any) =>
                  setHoveredEmployee(e?.payload?.name || null),
                onMouseLeave: () => setHoveredEmployee(null),
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Search & Risk Filter */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search Employee..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />

        <select
          value={riskLevelFilter}
          onChange={(e) => setRiskLevelFilter(e.target.value as RiskFilter)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="ALL">All Risk Levels</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded shadow overflow-x-auto mb-8">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3">Transactions</th>
              <th className="p-3">Avg Risk</th>
              <th className="p-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((e) => {
              const filteredCustomers = e.customers.filter((c) =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase())
              );

              return (
                <React.Fragment key={e.id}>
                  <tr
                    className={`border-t hover:bg-gray-50 cursor-pointer ${
                      hoveredEmployee === e.name ? "bg-blue-100" : ""
                    }`}
                    onClick={() =>
                      setExpandedEmployeeId(
                        expandedEmployeeId === e.id ? null : e.id
                      )
                    }
                  >
                    <td className="p-3 font-medium">{e.name}</td>
                    <td className="p-3 text-center">{e.totalTransactions}</td>
                    <td className="p-3 text-center">{e.avgRisk.toFixed(1)}</td>
                    <td className="p-3 text-center">
                      <RiskBadge risk={e.avgRisk} />
                    </td>
                  </tr>

                  {expandedEmployeeId === e.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="p-4">
                        <h4 className="font-semibold mb-2">
                          Customers handled by {e.name}
                        </h4>

                        <input
                          type="text"
                          placeholder="Search customers..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="border p-2 rounded w-full md:w-1/3 mb-3"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredCustomers.map((c) => (
                            <div
                              key={c.id}
                              className={`border rounded p-3 bg-white hover:shadow cursor-pointer ${
                                c.anomaly ? "border-red-500" : ""
                              }`}
                              onClick={() =>
                                navigate(
                                  `/transactions?employeeId=${e.id}&customerId=${c.id}`
                                )
                              }
                            >
                              <div className="font-medium">{c.name}</div>
                              <div className="text-sm">
                                Transactions: {c.count}
                              </div>
                              <div className="text-sm">
                                Avg Risk: <strong>{c.avgRisk.toFixed(1)}</strong>
                              </div>
                              {c.anomaly && (
                                <div className="text-xs text-red-700 mt-1">
                                  ⚠️ {c.anomaly}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};

export default EmployeesPage;

/* ======================
   Helpers
====================== */
const SummaryCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "red" | "yellow" | "green";
}) => {
  const colorMap: any = {
    red: "text-red-700",
    yellow: "text-yellow-700",
    green: "text-green-700",
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-xl font-bold ${color ? colorMap[color] : ""}`}>
        {value}
      </div>
    </div>
  );
};

const RiskBadge = ({ risk }: { risk: number }) => {
  if (risk >= 75)
    return (
      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
        High
      </span>
    );
  if (risk >= 40)
    return (
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
        Medium
      </span>
    );
  return (
    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
      Low
    </span>
  );
};
