import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSalesInvoicesAPI, SalesAPIResponse } from "@/hooks/useSalesAPI";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface SalesInvoicesTableProps {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const transformAPIDataToTable = (apiData: SalesAPIResponse[]) => {
  return apiData.map((item) => ({
    id: item.id,
    date: item.invoice_date ? new Date(item.invoice_date) : new Date(),
    number: item.number,
    dueDate: item.due_date ? new Date(item.due_date) : undefined,
    status: item.status || "draft",
    amount: item.grand_total ?? 0,
  }));
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "overdue":
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "draft":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "sent":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "partial":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export function SalesInvoicesTable({ onView, onEdit, onDelete }: SalesInvoicesTableProps) {
  const { data: apiData, isLoading, error, page, limit, totalPages, total, handlePageChange, handleLimitChange, refresh } = useSalesInvoicesAPI();
  const invoices = transformAPIDataToTable(apiData);

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Loading invoices...</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <span className="text-sm text-red-600">{error}</span>
                  <Button variant="outline" size="sm" onClick={refresh} className="mt-2">
                    Try Again
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.date.toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>
                    <button onClick={() => (window.location.href = `/sales-invoice/${invoice.id}`)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      {invoice.number}
                    </button>
                  </TableCell>
                  <TableCell>{invoice.dueDate ? invoice.dueDate.toLocaleDateString("en-GB") : "-"}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusColor(invoice.status))}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">Rp {formatPriceWithSeparator(invoice.amount)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            onView?.(invoice.id);
                            window.location.href = `/sales-invoice/${invoice.id}`;
                          }}
                          className="flex items-center cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(invoice.id)} className="flex items-center cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete?.(invoice.id)} className="flex items-center cursor-pointer text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} itemsPerPage={limit} onItemsPerPageChange={handleLimitChange} totalItems={total} />
    </div>
  );
}
