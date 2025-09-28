import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Check, X, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApprovals, ApprovalAPIResponse } from "@/hooks/useApprovals";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface ApprovalTableGenericProps {
  action: 'getApprovalQuotation' | 'getApprovalRequest' | 'getApprovalShipment' | 'getApprovalInvoice' | 'getApprovalBillingInvoice';
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

// Transform API data to table format
const transformAPIDataToTable = (apiData: ApprovalAPIResponse[]) => {
  return apiData.map(item => ({
    id: item.id,
    date: new Date(item.date || item.created_at),
    number: item.number,
    status: item.status,
    amount: item.grand_total || item.amount,
    vendorName: item.vendor_name || ''
  }));
};

export function ApprovalTableGeneric({ 
  action,
  onApprove,
  onReject,
  refreshKey
}: ApprovalTableGenericProps) {
  const {
    data: apiData,
    isLoading,
    error,
    page,
    limit,
    totalPages,
    total,
    handlePageChange,
    handleLimitChange,
    refresh
  } = useApprovals(action, refreshKey);

  // Transform API data to table format
  const approvals = transformAPIDataToTable(apiData);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [approvalToAction, setApprovalToAction] = useState<{id: string, action: 'approve' | 'reject'} | null>(null);

  const handleApproveClick = (id: string) => {
    setApprovalToAction({id, action: 'approve'});
    setConfirmDialogOpen(true);
  };

  const handleRejectClick = (id: string) => {
    setApprovalToAction({id, action: 'reject'});
    setConfirmDialogOpen(true);
  };

  const confirmAction = () => {
    if (approvalToAction) {
      if (approvalToAction.action === 'approve') {
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
              <TableHead>Vendor</TableHead>
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
              <TableHead>Vendor</TableHead>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refresh}
                    className="mt-2"
                  >
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
              <TableHead>Vendor</TableHead>
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
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell className="font-medium">
                  {format(approval.date, 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Link 
                    to={`/purchase-quotation/${approval.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {approval.number}
                  </Link>
                </TableCell>
                <TableCell>{approval.vendorName}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeProps(approval.status)}>
                    {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  Rp {formatPriceWithSeparator(approval.amount)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleApproveClick(approval.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRejectClick(approval.id)}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {approvals.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleLimitChange}
          itemsPerPageOptions={[5, 10, 20, 50]}
        />
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalToAction?.action === 'approve' ? 'Approve' : 'Reject'} Approval?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approvalToAction?.action === 'approve' 
                ? 'Are you sure you want to approve this item? This action will process the approval.'
                : 'Are you sure you want to reject this item? This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction} 
              className={approvalToAction?.action === 'approve' 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
              }
            >
              {approvalToAction?.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
