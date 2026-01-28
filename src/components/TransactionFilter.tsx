import type { Dispatch, SetStateAction } from "react";


interface Props {
  minRisk: number;
  setMinRisk: Dispatch<SetStateAction<number>>;
  employeeFilter: string;
  setEmployeeFilter: Dispatch<SetStateAction<string>>;
  employees: string[];
}

export default function TransactionFilter({
  minRisk,
  setMinRisk,
  employeeFilter,
  setEmployeeFilter,
  employees,
}: Props) {
  return (
    <div className="flex gap-4 mb-6">
      {/* Risk Slider */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold">
          Minimum Risk Score: {minRisk}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={minRisk}
          onChange={(e) => setMinRisk(Number(e.target.value))}
          className="w-48"
        />
      </div>

      {/* Employee Dropdown */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold">Employee</label>
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Employees</option>
          {employees.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
