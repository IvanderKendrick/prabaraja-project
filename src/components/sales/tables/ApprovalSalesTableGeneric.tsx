import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Check, X, Loader2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useApprovalsSales, ApprovalSalesAPIResponse } from "@/hooks/useApprovalsSales";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface ApprovalSalesTableGenericProps {
  action: "getApprovalQuotation" | "getApprovalOrder" | "getApprovalInvoice";
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  refreshKey?: number;
}

const getStatusBadgeProps = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

// Transform API data to table format based on action type
const transformAPIDataToTable = (apiData: ApprovalSalesAPIResponse[], action: string) => {
  return apiData.map((item) => {
    let date: Date;
    let amount: number;

    // Map fields based on action type
    if (action === "getApprovalQuotation") {
      date = new Date(item.quotation_date || item.created_at);
      amount = typeof item.total === "string" ? parseFloat(item.total) || 0 : item.total ?? 0;
    } else if (action === "getApprovalOrder") {
      date = new Date(item.order_date || item.created_at);
      amount = typeof item.grand_total === "string" ? parseFloat(item.grand_total) || 0 : item.grand_total ?? 0;
    } else {
      // Invoice
      date = new Date(item.invoice_date || item.created_at);
      amount = typeof item.grand_total === "string" ? parseFloat(item.grand_total) || 0 : item.grand_total ?? 0;
    }

    return {
      id: item.id,
      date,
      number: item.number,
      status: item.status,
      amount,
      customerName: item.customer_name || "",
    };
  });
};

export function ApprovalSalesTableGeneric({ action, onApprove, onReject, refreshKey }: ApprovalSalesTableGenericProps) {
  const { data: apiData, isLoading, error, page, limit, totalPages, total, handlePageChange, handleLimitChange, refresh } = useApprovalsSales(action, refreshKey);

  // Transform API data to table format
  const approvals = transformAPIDataToTable(apiData, action);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [approvalToAction, setApprovalToAction] = useState<{ id: string; action: "approve" | "reject" } | null>(null);

  const handleApproveClick = (id: string) => {
    setApprovalToAction({ id, action: "approve" });
    setConfirmDialogOpen(true);
  };

  const handleRejectClick = (id: string) => {
    setApprovalToAction({ id, action: "reject" });
    setConfirmDialogOpen(true);
  };

  const confirmAction = () => {
    if (approvalToAction) {
      if (approvalToAction.action === "approve") {
        onApprove?.(approvalToAction.id);
      } else {
        onReject?.(approvalToAction.id);
      }
    }
    setConfirmDialogOpen(false);
    setApprovalToAction(null);
  };

  const cancelAction = () => {
    setApprovalToAction(null);
    setConfirmDialogOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
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
                  <span className="text-sm text-gray-500">Loading approvals...</span>
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
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
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

  // Empty state
  if (approvals.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No approvals found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">{approval.date.toLocaleDateString("en-GB")}</TableCell>
                  <TableCell className="font-medium">{approval.number}</TableCell>
                  <TableCell>{approval.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", getStatusBadgeProps(approval.status))}>
                      {approval.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">Rp {formatPriceWithSeparator(approval.amount)}</TableCell>
                  <TableCell>
                    {approval.status.toLowerCase() === "pending" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleApproveClick(approval.id)} className="flex items-center cursor-pointer text-green-600">
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRejectClick(approval.id)} className="flex items-center cursor-pointer text-red-600">
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} itemsPerPage={limit} onItemsPerPageChange={handleLimitChange} totalItems={total} />
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {approvalToAction?.action === "approve" ? "Approval" : "Rejection"}</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to {approvalToAction?.action === "approve" ? "approve" : "reject"} this item? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className={approvalToAction?.action === "reject" ? "bg-red-600 hover:bg-red-700" : ""}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
