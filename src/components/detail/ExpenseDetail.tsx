import { useParams, Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ArrowLeft, Download, FileText, Printer, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  amount: number;
}

interface ExpenseData {
  id: string;
  user_id: string;
  number: number;
  date: string;
  category: string;
  beneficiary: string;
  status: "Paid" | "Require Approval";
  items: ExpenseItem[];
  grand_total: number;
  created_at: string;
  updated_at?: string;
}

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const {
    data: expense,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      if (!id) throw new Error("Expense ID is required");

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching expense:", error);
        throw error;
      }

      // Transform the Supabase data to match our interface
      const transformedExpense: ExpenseData = {
        id: data.id,
        user_id: data.user_id,
        number: data.number,
        date: data.date,
        category: data.category,
        beneficiary: data.beneficiary,
        status: data.status as "Paid" | "Require Approval",
        items: Array.isArray(data.items)
          ? (data.items as unknown as ExpenseItem[])
          : [],
        grand_total: data.grand_total,
        created_at: data.created_at,
        updated_at: data.updated_at || undefined,
      };

      return transformedExpense;
    },
    enabled: !!id && !!user,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2  mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expense details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Expense Not Found</h1>
          <p className="text-gray-500 mb-4">
            The expense you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/expenses">
            <Button>Return to Expenses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `Rp. ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Header with gradient background */}
        <div className="px-8 pt-8">
          <div className="flex items-center gap-4">
            <Link to="/expenses">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold  flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {expense.number}
              </h1>
              <p className=" text-sm">Expense from {expense.date}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Action Buttons */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold px-2">Expense Details</h2>
              <p className="text-gray-500 px-2">
                View and manage expense information
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Expense Information
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Number:</span>
                      <span className="font-medium">{expense.number}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Date:</span>
                      <span>{expense.date}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Category:</span>
                      <span>{expense.category}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Beneficiary:</span>
                      <span>{expense.beneficiary}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          expense.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Summary</h2>
                  <div className="p-6 bg-gray-50 rounded-lg border">
                    <div className="text-right">
                      <p className="text-gray-500 mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(expense.grand_total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Expense Items</h2>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expense.items && expense.items.length > 0 ? (
                    expense.items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.quantity * item.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-gray-500"
                      >
                        No items found for this expense.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Total:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(expense.grand_total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
