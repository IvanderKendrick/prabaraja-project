import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionDropdown } from "./ActionDropdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { Expense } from "@/types/expense";
import { Pagination } from "@/components/Pagination";

interface ExpenseTableProps {
  expenses: Expense[];
  tableType: "expenses" | "approval";
  onDeleteExpense: (id: string) => void;
  onApproveExpense?: (id: string) => void;
}

export const ExpenseTable = ({
  expenses,
  tableType,
  onDeleteExpense,
  onApproveExpense,
}: ExpenseTableProps) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const filteredExpenses = expenses.filter(
    (expense) =>
      (tableType === "expenses" && expense.status === "Paid") ||
      (tableType === "approval" && expense.status === "Require Approval")
  );

  // Pagination logic
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredExpenses.slice(startIndex, endIndex);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `Rp. ${numAmount.toLocaleString("id-ID")}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 px-4">
        Showing{" "}
        {
          filteredExpenses.filter(
            (expense) =>
              (tableType === "expenses" && expense.status === "Paid") ||
              (tableType === "approval" &&
                expense.status === "Require Approval")
          ).length
        }{" "}
        Entries.
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Beneficiary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total (in IDR)</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        {/* <TableBody>
          {filteredExpenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No {tableType === "approval" ? "pending approval" : "paid"} expenses found
              </TableCell>
            </TableRow>
          ) : (
            filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.date}</TableCell>
                <TableCell>
                  <Link to={`/expense/${expense.id}`} className="text-blue-600 hover:underline">
                    {expense.number}
                  </Link>
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="text-blue-600">{expense.beneficiary}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${expense.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{expense.status}</span>
                </TableCell>
                <TableCell>{formatCurrency(expense.total)}</TableCell>
                <TableCell>
                  {tableType === "approval" && onApproveExpense ? (
                    <ActionDropdown expenseId={expense.id} onApprove={onApproveExpense} onDelete={onDeleteExpense} />
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete this expense? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteExpense(expense.id)} className="bg-red-600 hover:bg-red-700">
                            Yes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody> */}
        <TableBody>
          {currentData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-6 text-muted-foreground"
              >
                No {tableType === "approval" ? "pending approval" : "paid"}{" "}
                expenses found
              </TableCell>
            </TableRow>
          ) : (
            currentData.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.date}</TableCell>
                <TableCell>
                  <Link
                    to={`/expense/${expense.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {expense.number}
                  </Link>
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="text-blue-600">
                  {expense.beneficiary}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      expense.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {expense.status}
                  </span>
                </TableCell>
                <TableCell>{formatCurrency(expense.total)}</TableCell>
                <TableCell>
                  {tableType === "approval" && onApproveExpense ? (
                    <ActionDropdown
                      expenseId={expense.id}
                      onApprove={onApproveExpense}
                      onDelete={onDeleteExpense}
                    />
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this expense? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteExpense(expense.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Yes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemsPerPageOptions={[5, 10, 20, 50]}
        />
      )}
    </div>
  );
};
