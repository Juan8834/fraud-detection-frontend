import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
import EmployeesPage from "./pages/EmployeesPage";
import CustomersPage from "./pages/CustomersPage";

import { HiMenu, HiX } from "react-icons/hi";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded font-medium transition ${
      isActive ? "bg-gray-300 font-bold" : "hover:bg-gray-200"
    }`;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-20 w-64 bg-white shadow-md p-4 flex flex-col h-full transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="md:hidden flex justify-end mb-4">
          <button onClick={() => setSidebarOpen(false)}>
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <h1 className="text-xl font-bold mb-6">Fraud Dashboard</h1>

        <nav className="flex flex-col space-y-2">
          <NavLink to="/dashboard" className={linkClass} onClick={() => setSidebarOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={linkClass} onClick={() => setSidebarOpen(false)}>
            Transactions
          </NavLink>
          <NavLink to="/employees" className={linkClass} onClick={() => setSidebarOpen(false)}>
            Employees
          </NavLink>
          <NavLink to="/customers" className={linkClass} onClick={() => setSidebarOpen(false)}>
            Customers
          </NavLink>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-10 flex items-center justify-between bg-white shadow p-4">
          <button onClick={() => setSidebarOpen(true)}>
            <HiMenu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Fraud Dashboard</h1>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/transactions"
          element={
            <Layout>
              <TransactionsPage />
            </Layout>
          }
        />
        <Route
          path="/employees"
          element={
            <Layout>
              <EmployeesPage />
            </Layout>
          }
        />
        <Route
          path="/customers"
          element={
            <Layout>
              <CustomersPage />
            </Layout>
          }
        />

        <Route
          path="*"
          element={
            <Layout>
              <div className="p-4 text-center text-gray-600">
                Page not found
              </div>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
