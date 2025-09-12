
export interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  amount: number;
}

export type ExpenseStatus = "Paid" | "Require Approval";

export interface Expense {
  id: string;
  date: string;
  number: string;
  category: string;
  beneficiary: string;
  status: ExpenseStatus;
  items: ExpenseItem[];
  total: string;
}

// Predefined expense categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  "Cost of Sales",
  "Fuel, Toll and Parking - General",
  "Office Supplies",
  "Rent",
  "Utilities",
  "Travel",
  "Meals and Entertainment",
  "Professional Services",
  "Insurance",
  "Other"
];

// Local storage key
export const EXPENSES_STORAGE_KEY = "expenses";
