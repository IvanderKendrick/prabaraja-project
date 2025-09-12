
import { Expense, ExpenseStatus, EXPENSES_STORAGE_KEY } from "@/types/expense";

// Get expenses from local storage
export const getExpenses = (): Expense[] => {
  try {
    const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (storedExpenses) {
      return JSON.parse(storedExpenses);
    }
  } catch (error) {
    console.error("Error getting expenses from localStorage:", error);
  }
  return [];
};

// Save expenses to local storage
export const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Error saving expenses to localStorage:", error);
  }
};

// Delete an expense by ID
export const deleteExpense = (id: string): Expense[] => {
  const expenses = getExpenses();
  const updatedExpenses = expenses.filter((expense) => expense.id !== id);
  saveExpenses(updatedExpenses);
  return updatedExpenses;
};

// Update expense status
export const updateExpenseStatus = (id: string, newStatus: ExpenseStatus): Expense[] => {
  const expenses = getExpenses();
  const updatedExpenses = expenses.map((expense) => 
    expense.id === id ? { ...expense, status: newStatus } : expense
  );
  saveExpenses(updatedExpenses);
  return updatedExpenses;
};

// Approve an expense (change status from "Require Approval" to "Paid")
export const approveExpense = (id: string): Expense[] => {
  return updateExpenseStatus(id, "Paid");
};
