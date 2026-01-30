import axios from "axios";
import { API_URL } from "./config";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  storeId: number;
  suspicionScore: number;
  flaggedCount: number;
  isFlagged: boolean;
  createdAt: string;
}

export async function fetchEmployeeById(id: number): Promise<Employee> {
  const res = await axios.get(`${API_URL}/employees/${id}`);
  return res.data;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await axios.get(`${API_URL}/employees`);
  return res.data;
}
