import { format } from "date-fns";
import { MoreHorizontal, Edit, CreditCard, Trash2, Loader2, AlertCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InvoicePurchase } from "@/types/purchase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useInvoicesAPI, PurchaseAPIResponse } from "@/hooks/usePurchasesAPI";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface InvoicesTableProps {
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReceivePayment?: (id: string) => void;
  onView?: (id: string) => void;
}

const getStatusBadgeProps = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "half-paid":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Transform API data to table format
const transformAPIDataToTable = (apiData: PurchaseAPIResponse[]): InvoicePurchase[] => {
  return apiData.map((item) => ({
    id: item.id,
    date: new Date(item.date),
    number: item.number,
    dueDate: item.due_date ? new Date(item.due_date) : undefined,
    status: item.status as any,
    amount: item.grand_total || item.amount,
    type: "invoice" as const,
    items: item.items || [],
    // Add any additional fields that might be needed
    paid_amount: (item as any).paid_amount || 0,
    grand_total: item.grand_total || item.amount,
    approver: (item as any).approver || "",
    tags: (item as any).tags || [],
    itemCount: Array.isArray(item.items) ? item.items.length : 0,
  }));
};

export function InvoicesTable({ onDelete, onEdit, onReceivePayment, onView }: InvoicesTableProps) {
  const { data: apiData, isLoading, error, page, limit, totalPages, total, handlePageChange, handleLimitChange, refresh } = useInvoicesAPI();

  // Transform API data to table format
  const invoices = transformAPIDataToTable(apiData);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      onDelete(invoiceToDelete);
    }
    setDeleteDialogOpen(false);

    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };

  const cancelDelete = () => {
    setInvoiceToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleReceivePayment = (id: string) => {
    // For now, just mark as completed
    // In a real app, this would open a payment dialog
    onReceivePayment?.(id);
  };

  // Loading state
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
              <TableHead>Balance</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
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

  // Error state
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
              <TableHead>Balance</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
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
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const paidAmount = (invoice as any).paid_amount || 0;
                const invoiceTotal = (invoice as any).grand_total || invoice.amount;
                const remainingAmount = invoiceTotal - paidAmount;

                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.date.toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>
                      <button onClick={() => (onView ? onView(invoice.id) : (window.location.href = `/purchase-invoice/${invoice.id}`))} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        {invoice.number}
                      </button>
                    </TableCell>
                    <TableCell>{invoice.dueDate ? invoice.dueDate.toLocaleDateString("en-GB") : "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeProps(invoice.status)}>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">Rp {formatPriceWithSeparator(remainingAmount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(invoice.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(invoice.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}

                          {(invoice.status === "pending" || invoice.status === "Half-paid") && onReceivePayment && (
                            <DropdownMenuItem onClick={() => handleReceivePayment(invoice.id)} className="text-green-600">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Receive Payment
                            </DropdownMenuItem>
                          )}

                          {onDelete && (
                            <DropdownMenuItem onClick={() => handleDeleteClick(invoice.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {invoices.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} totalItems={apiData.length * totalPages} itemsPerPage={limit} onPageChange={handlePageChange} onItemsPerPageChange={handleLimitChange} itemsPerPageOptions={[5, 10, 20, 50]} />
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the invoice.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>No</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
