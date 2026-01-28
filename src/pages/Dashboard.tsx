import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Transaction } from "../types/transaction";

/* ======================
   Colors
===================== */
const PIE_COLORS = ["#16a34a", "#dc2626"]; // purchases, fraud

const RISK_COLORS = {
  low: "#16a34a", // green
  medium: "#facc15", // yellow
  high: "#dc2626", // red
};

/* ======================
   Dashboard
===================== */
const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hoveredRiskLevel, setHoveredRiskLevel] = useState<string | null>(null);
  const [hoveredType, setHoveredType] = useState<"fraud" | "purchase" | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("http://localhost:5000/transactions");
      const data: Transaction[] = await res.json();
      setTransactions(data);
    }
    fetchData();
  }, []);

  /* ======================
     Derived Metrics
  ====================== */
  const fraudCount = transactions.filter((t) => t.isFraud).length;
  const purchaseCount = transactions.length - fraudCount;

  const avgRisk =
    transactions.reduce((sum, t) => sum + (t.riskScore ?? 0), 0) /
    (transactions.length || 1);

  const pieData = [
    { name: "Purchases", value: purchaseCount },
    { name: "Fraud", value: fraudCount },
  ];

  /* ======================
     Risk Distribution
  ====================== */
  const riskBuckets = useMemo(() => {
    return [
      {
        label: "Low (0–39)",
        level: "low",
        count: transactions.filter((t) => (t.riskScore ?? 0) < 40).length,
      },
      {
        label: "Medium (40–74)",
        level: "medium",
        count: transactions.filter(
          (t) => (t.riskScore ?? 0) >= 40 && (t.riskScore ?? 0) < 75
        ).length,
      },
      {
        label: "High (75+)",
        level: "high",
        count: transactions.filter((t) => (t.riskScore ?? 0) >= 75).length,
      },
    ];
  }, [transactions]);

  /* ======================
     Top Risk Entities
  ====================== */
  const topEmployees = useMemo(() => {
    const map = new Map<
      number,
      { name: string; avgRisk: number; count: number; types: Set<"fraud" | "purchase"> }
    >();

    transactions.forEach((t) => {
      if (!t.employee || t.riskScore == null) return;
      const prev = map.get(t.employee.id);
      const types = prev ? new Set(prev.types) : new Set<"fraud" | "purchase">();
      const typeNormalized = t.isFraud ? "fraud" : "purchase";
      types.add(typeNormalized);
      map.set(t.employee.id, {
        name: `${t.employee.firstName} ${t.employee.lastName}`,
        avgRisk: prev
          ? (prev.avgRisk * prev.count + t.riskScore) / (prev.count + 1)
          : t.riskScore,
        count: prev ? prev.count + 1 : 1,
        types,
      });
    });

    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.avgRisk - a.avgRisk)
      .slice(0, 5);
  }, [transactions]);

  const topCustomers = useMemo(() => {
    const map = new Map<
      number,
      { name: string; avgRisk: number; count: number; types: Set<"fraud" | "purchase"> }
    >();

    transactions.forEach((t) => {
      if (!t.customer || t.riskScore == null) return;
      const prev = map.get(t.customer.id);
      const types = prev ? new Set(prev.types) : new Set<"fraud" | "purchase">();
      const typeNormalized = t.isFraud ? "fraud" : "purchase";
      types.add(typeNormalized);
      map.set(t.customer.id, {
        name: t.customer.name,
        avgRisk: prev
          ? (prev.avgRisk * prev.count + t.riskScore) / (prev.count + 1)
          : t.riskScore,
        count: prev ? prev.count + 1 : 1,
        types,
      });
    });

    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.avgRisk - a.avgRisk)
      .slice(0, 5);
  }, [transactions]);

  /* ======================
     UI
  ====================== */
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Kpi title="Total Transactions" value={transactions.length} />
        <Kpi title="Fraud Transactions" value={fraudCount} />
        <Kpi
          title="Fraud Rate"
          value={`${((fraudCount / (transactions.length || 1)) * 100).toFixed(1)}%`}
        />
        <Kpi title="Avg Risk Score" value={avgRisk.toFixed(1)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Fraud vs Purchases</h2>
          <PieChart width={300} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={100}
              label
              onClick={(data) =>
                navigate(`/transactions?type=${data.name.toLowerCase()}`)
              }
              onMouseOver={(data) =>
                setHoveredType(
                  (data.name as string).toLowerCase() === "fraud"
                    ? "fraud"
                    : "purchase"
                )
              }
              onMouseOut={() => setHoveredType(null)}
            >
              {pieData.map((_, i) => (
                <Cell
                  key={i}
                  fill={PIE_COLORS[i]}
                  opacity={
                    hoveredType &&
                    hoveredType !== (_.name as string).toLowerCase()
                      ? 0.5
                      : 1
                  }
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Risk Distribution Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Risk Distribution</h2>
          <BarChart width={350} height={300} data={riskBuckets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="count"
              onClick={(data) => {
                const riskLevel = (data as any).level;
                if (riskLevel === "low") navigate("/transactions?minRisk=0&maxRisk=39");
                if (riskLevel === "medium")
                  navigate("/transactions?minRisk=40&maxRisk=74");
                if (riskLevel === "high") navigate("/transactions?minRisk=75");
              }}
              onMouseOver={(data) => setHoveredRiskLevel((data as any).level)}
              onMouseOut={() => setHoveredRiskLevel(null)}
            >
              {riskBuckets.map((entry, index) => (
                <Cell
                  key={index}
                  fill={RISK_COLORS[entry.level as keyof typeof RISK_COLORS]}
                  opacity={
                    hoveredRiskLevel && hoveredRiskLevel !== entry.level ? 0.5 : 1
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>

      {/* High Risk Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RiskTable
          title="High-Risk Employees"
          rows={topEmployees}
          hoveredRiskLevel={hoveredRiskLevel}
          hoveredType={hoveredType}
          onClick={(id) => navigate(`/transactions?employeeId=${id}`)}
        />
        <RiskTable
          title="High-Risk Customers"
          rows={topCustomers}
          hoveredRiskLevel={hoveredRiskLevel}
          hoveredType={hoveredType}
          onClick={(id) => navigate(`/transactions?customerId=${id}`)}
        />
      </div>
    </PageContainer>
  );
};

export default Dashboard;

/* ======================
   Reusable Components
===================== */
const Kpi = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-white rounded shadow p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const RiskTable = ({
  title,
  rows,
  hoveredRiskLevel,
  hoveredType,
  onClick,
}: {
  title: string;
  rows: {
    id: number;
    name: string;
    avgRisk: number;
    count?: number;
    types?: Set<"fraud" | "purchase">;
  }[];
  hoveredRiskLevel?: string | null;
  hoveredType?: "fraud" | "purchase" | null;
  onClick: (id: number) => void;
}) => (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="font-semibold mb-3">{title}</h2>
    <ul>
      {rows.map((r) => {
        const riskLevel =
          r.avgRisk >= 75 ? "high" : r.avgRisk >= 40 ? "medium" : "low";
        const riskHighlighted = hoveredRiskLevel === riskLevel;
        const typeHighlighted = hoveredType && r.types?.has(hoveredType);
        const isHighlighted = riskHighlighted || typeHighlighted;

        return (
          <li
            key={r.id}
            className={`flex justify-between p-2 hover:bg-gray-100 cursor-pointer rounded ${
              isHighlighted ? "bg-gray-200" : ""
            }`}
            onClick={() => onClick(r.id)}
          >
            <span>{r.name}</span>
            <span
              className={`px-2 py-1 text-white text-xs font-semibold rounded ${
                riskLevel === "high"
                  ? "bg-red-600"
                  : riskLevel === "medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            >
              {r.avgRisk.toFixed(1)}
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);
