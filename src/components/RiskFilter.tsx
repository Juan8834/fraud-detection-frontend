import React from "react";
import type { Employee } from "../api/employees";

interface Props {
  minRisk: number;
  setMinRisk: React.Dispatch<React.SetStateAction<number>>;
  employees: Employee[];
  employeeFilter: Employee | null;
  setEmployeeFilter: React.Dispatch<React.SetStateAction<Employee | null>>;
}

const RiskFilter: React.FC<Props> = ({
  minRisk,
  setMinRisk,
  employees,
  employeeFilter,
  setEmployeeFilter,
}) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      {/* Minimum Risk Slider */}
      <label className="flex items-center gap-2">
        <span className="font-medium">Minimum Risk: {minRisk}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={minRisk}
          onChange={(e) => setMinRisk(Number(e.target.value))}
          className="cursor-pointer"
        />
      </label>

      {/* Employee Dropdown */}
      <label className="flex items-center gap-2">
        <span className="font-medium">Employee:</span>
        <select
          value={employeeFilter?.id || ""}
          onChange={(e) => {
            const emp = employees.find((emp) => emp.id === Number(e.target.value)) || null;
            setEmployeeFilter(emp);
          }}
          className="border rounded p-1"
        >
          <option value="">All</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default RiskFilter;
