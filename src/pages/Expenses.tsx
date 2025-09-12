import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseTabs } from "@/components/expenses/ExpenseTabs";
import { ExpenseSummaryCards } from "@/components/expenses/ExpenseSummaryCards";
import {
  useExpenses,
  useDeleteExpense,
  useUpdateExpense,
} from "@/hooks/useExpenses";
import { toast } from "sonner";
import type { Expense as TypesExpense } from "@/types/expense";
import { Input } from "@/components/ui/input";

const Expenses = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"expenses" | "approval">(
    "expenses"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Use Supabase hooks for data management
  const { data: expenses = [], isLoading, error } = useExpenses();
  const deleteExpenseMutation = useDeleteExpense();
  const updateExpenseMutation = useUpdateExpense();

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpenseMutation.mutateAsync(id);
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      await updateExpenseMutation.mutateAsync({
        id,
        updates: { status: "Paid" },
      });
      toast.success("Expense approved successfully");
    } catch (error) {
      console.error("Error approving expense:", error);
      toast.error("Failed to approve expense");
    }
  };

  const navigateToCreateExpense = () => {
    navigate("/create-expense");
  };

  // Transform expenses from Supabase format to frontend format
  const transformedExpenses: TypesExpense[] = expenses.map((expense) => ({
    id: expense.id,
    date: expense.date,
    number: expense.number.toString(),
    category: expense.category,
    beneficiary: expense.beneficiary,
    status: expense.status as "Paid" | "Require Approval",
    items: Array.isArray(expense.items)
      ? expense.items.map((item: any) => ({
          id: item.id || "",
          name: item.name || "",
          quantity: item.quantity || 0,
          amount: item.amount || item.total || 0,
        }))
      : [],
    total: expense.grand_total.toString(),
  }));

  // Filter expenses based on search query
  const filteredExpenses = transformedExpenses.filter((expense) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      expense.number.toString().toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower) ||
      expense.beneficiary.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Header
            title="List of Expense"
            description="Manage your company expenses"
          />
          <div className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading expenses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Header
            title="List of Expense"
            description="Manage your company expenses"
          />
          <div className="p-6">
            <div className="text-center py-8 text-red-600">
              <p>Error loading expenses. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title="List of Expense"
          description="Manage your company expenses"
        />

        <div className="p-6">
          <div className="space-y-6">
            {/* Summary Cards */}
            <ExpenseSummaryCards expenses={transformedExpenses} />

            {/* Top Navigation */}
            <ExpenseTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Actions Bar */}
            <div className="flex justify-between items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " />
                <Input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                className="gap-2 shadow-lg text-white bg-sidebar-active px-5 py-3 h-auto rounded-md"
                onClick={navigateToCreateExpense}
              >
                <Plus className="ml-2 h-5 w-5" />
                Create Expenses
              </Button>
            </div>

            {/* Table */}
            <ExpenseTable
              expenses={filteredExpenses}
              tableType={activeTab}
              onDeleteExpense={handleDeleteExpense}
              onApproveExpense={handleApproveExpense}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
