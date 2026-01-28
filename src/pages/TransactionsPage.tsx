import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RiskFilter from "../components/RiskFilter";
import TransactionDetails from "../components/TransactionDetails";
import PageContainer from "../components/PageContainer";
import TransactionTable from "../components/TransactionTable"; // ✅ Import the table
import type { Transaction } from "../types/transaction";
import type { Employee } from "../api/employees"; // ✅ Use API Employee type

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [minRisk, setMinRisk] = useState<number>(0);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const employeeIdParam = searchParams.get("employeeId");
  const customerIdParam = searchParams.get("customerId");
  const typeParam = searchParams.get("type"); // ✅ Chart filter: type
  const minRiskParam = searchParams.get("minRisk"); // ✅ Chart filter: minRisk
  const maxRiskParam = searchParams.get("maxRisk"); // ✅ Chart filter: maxRisk

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("http://localhost:5000/transactions");
        const data: Transaction[] = await res.json();
        console.log("TX TYPES:", data.map((t) => t.type)); // 🔥 Proof log
        setTransactions(data);

        // Map transaction employees to full API Employee type
        const uniqueEmployees: Employee[] = Array.from(
          new Map(
            data
              .filter((tx) => tx.employee)
              .map((tx) => {
                const emp = tx.employee!;
                return [
                  emp.id,
                  {
                    id: emp.id,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    storeId: 0, // default placeholder
                    suspicionScore: 0,
                    flaggedCount: 0,
                    isFlagged: false,
                    createdAt: new Date().toISOString(),
                  } as Employee,
                ];
              })
          ).values()
        );

        setEmployees(uniqueEmployees);

        if (employeeIdParam) {
          const emp = uniqueEmployees.find(e => e.id === Number(employeeIdParam)) || null;
          setSelectedEmployee(emp);
        }
      } catch (err) {
        console.error("❌ Failed to load transactions", err);
      }
    }

    fetchTransactions();
  }, [employeeIdParam]);

  /* ======================
     Filter transactions based on query params
  ====================== */
  const filteredTransactions = transactions.filter((tx) => {
    const risk = tx.riskScore ?? 0;

    const meetsRisk =
      (minRiskParam ? risk >= Number(minRiskParam) : true) &&
      (maxRiskParam ? risk <= Number(maxRiskParam) : true);

    const meetsType = typeParam
      ? typeParam.toLowerCase() === "purchases"
        ? !tx.isFraud // ✅ Purchases slice shows all non-fraud transactions
        : tx.type?.toLowerCase() === typeParam.toLowerCase()
      : true;

    const meetsEmployee = selectedEmployee
      ? tx.employee?.id === selectedEmployee.id
      : employeeIdParam
      ? tx.employee?.id === Number(employeeIdParam)
      : true;

    const meetsCustomer = customerIdParam
      ? tx.customer?.id === Number(customerIdParam)
      : true;

    return meetsRisk && meetsType && meetsEmployee && meetsCustomer;
  });

  return (
    <PageContainer>
      {/* Filters */}
      <RiskFilter
        minRisk={minRisk}
        setMinRisk={setMinRisk}
        employees={employees}
        employeeFilter={selectedEmployee}
        setEmployeeFilter={setSelectedEmployee}
      />

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onSelectTransaction={setSelectedTransaction}
      />

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </PageContainer>
  );
};

export default TransactionsPage;
