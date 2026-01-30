import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import type { Transaction } from "../types/transaction";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/* ======================
   Config
====================== */
import { API_URL } from "../api/config";

/* ======================
   Types
====================== */
type EmployeeConnection = {
  id: number;
  name: string;
  count: number;
  avgRisk: number;
  suspicious?: boolean;
  anomaly?: string;
};

type CustomerSummary = {
  id: number;
  name: string;
  totalTransactions: number;
  avgRisk: number;
  employees: EmployeeConnection[];
};

type RiskFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

/* ======================
   Component
====================== */
const CustomersPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);

  // Filter & search states
  const [customerSearchName, setCustomerSearchName] = useState("");
  const [riskFilter] = useState<RiskFilter>("ALL");
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Hover state for chart → table highlighting
  const [hoveredCustomer, setHoveredCustomer] = useState<string | null>(null);

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
     Build Customer → Employee Relationships
  ====================== */
  const customers: CustomerSummary[] = useMemo(() => {
    const map = new Map<number, CustomerSummary & { riskTotal: number }>();

    transactions.forEach((t) => {
      if (!t.customer || !t.employee || t.riskScore == null) return;

      if (!map.has(t.customer.id)) {
        map.set(t.customer.id, {
          id: t.customer.id,
          name: t.customer.name,
          totalTransactions: 0,
          avgRisk: 0,
          riskTotal: 0,
          employees: [],
        });
      }

      const customer = map.get(t.customer.id)!;
      customer.totalTransactions += 1;
      customer.riskTotal += t.riskScore;
      customer.avgRisk = customer.riskTotal / customer.totalTransactions;

      let emp = customer.employees.find((e) => e.id === t.employee!.id);
      if (!emp) {
        emp = {
          id: t.employee.id,
          name: `${t.employee.firstName} ${t.employee.lastName}`,
          count: 0,
          avgRisk: 0,
        };
        customer.employees.push(emp);
      }

      emp.count += 1;
      emp.avgRisk = (emp.avgRisk * (emp.count - 1) + t.riskScore) / emp.count;
      emp.suspicious = customer.avgRisk >= 75 && emp.avgRisk >= 75;
    });

    return Array.from(map.values()).sort((a, b) => b.avgRisk - a.avgRisk);
  }, [transactions]);

  /* ======================
     Top Risk Customers
  ====================== */
  const topRiskCustomers = useMemo(() => customers.slice(0, 3), [customers]);

  /* ======================
     Filter Customers
  ====================== */
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesName = c.name.toLowerCase().includes(customerSearchName.toLowerCase());

      let matchesRisk = true;
      if (riskFilter === "HIGH") matchesRisk = c.avgRisk >= 75;
      else if (riskFilter === "MEDIUM") matchesRisk = c.avgRisk >= 40 && c.avgRisk < 75;
      else if (riskFilter === "LOW") matchesRisk = c.avgRisk < 40;

      return matchesName && matchesRisk;
    });
  }, [customers, customerSearchName, riskFilter]);

  /* ======================
     Chart Data
  ====================== */
  const chartData = useMemo(
    () =>
      filteredCustomers.map((c) => ({
        name: c.name,
        transactions: c.totalTransactions,
        avgRisk: Number(c.avgRisk.toFixed(1)),
      })),
    [filteredCustomers]
  );

  /* ======================
     Chart Click Handler
  ====================== */
  const handleChartClick = (customerName: string) => {
    setCustomerSearchName(customerName);
  };

  /* ======================
     Row Highlight Helper
  ====================== */
  const isSelected = (customerName: string) =>
    customerSearchName === customerName || hoveredCustomer === customerName;

  /* ======================
     UI
  ====================== */
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      {/* 🔥 Top Risk Customers */}
      {topRiskCustomers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {topRiskCustomers.map((c) => (
            <div
              key={c.id}
              className="p-4 border border-red-300 bg-red-50 rounded cursor-pointer hover:shadow"
              onClick={() => navigate(`/transactions?customerId=${c.id}`)}
            >
              <div className="text-sm text-red-700 font-semibold">⚠️ High Risk</div>
              <div className="font-bold">{c.name}</div>
              <div className="text-sm">
                Avg Risk: {c.avgRisk.toFixed(1)} · Transactions: {c.totalTransactions}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Filter */}
      {customerSearchName && (
        <button
          onClick={() => setCustomerSearchName("")}
          className="text-xs text-blue-600 underline mb-2"
        >
          Clear customer filter
        </button>
      )}

      {/* Chart */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="font-semibold mb-4">Customer Activity & Risk</h2>
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
              onClick={(data: any) => data?.name && handleChartClick(data.name)}
              onMouseEnter={(data: any) => setHoveredCustomer(data?.name || null)}
              onMouseLeave={() => setHoveredCustomer(null)}
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
                onClick: (e: any) =>
                  e?.payload?.name && handleChartClick(e.payload.name),
                onMouseEnter: (e: any) =>
                  setHoveredCustomer(e?.payload?.name || null),
                onMouseLeave: () => setHoveredCustomer(null),
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3">Transactions</th>
              <th className="p-3">Avg Risk</th>
              <th className="p-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <React.Fragment key={c.id}>
                <tr
                  className={`border-t cursor-pointer ${
                    isSelected(c.name) ? "bg-blue-100" : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setExpandedCustomerId(expandedCustomerId === c.id ? null : c.id)
                  }
                >
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-center">{c.totalTransactions}</td>
                  <td className="p-3 text-center">{c.avgRisk.toFixed(1)}</td>
                  <td className="p-3 text-center">
                    <RiskBadge risk={c.avgRisk} />
                  </td>
                </tr>

                {expandedCustomerId === c.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="p-4">
                      <h4 className="font-semibold mb-2">
                        Employees interacting with {c.name}
                      </h4>

                      <input
                        type="text"
                        placeholder="Search employees..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        className="border p-2 rounded mb-3 w-full md:w-1/3"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {c.employees
                          .filter((e) =>
                            e.name.toLowerCase().includes(employeeSearch.toLowerCase())
                          )
                          .map((e) => (
                            <div
                              key={e.id}
                              className="border rounded p-3 bg-white hover:shadow cursor-pointer"
                              onClick={() =>
                                navigate(`/transactions?employeeId=${e.id}&customerId=${c.id}`)
                              }
                            >
                              <div className="font-medium">{e.name}</div>
                              <div className="text-sm">Transactions: {e.count}</div>
                              <div className="text-sm">
                                Avg Risk: <strong>{e.avgRisk.toFixed(1)}</strong>
                              </div>
                            </div>
                          ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};

export default CustomersPage;

/* ======================
   Helpers
====================== */
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
