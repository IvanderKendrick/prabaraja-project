import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, AlertTriangle, Check, X, Loader2, AlertCircle, Eye } from "lucide-react";
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
import { RequestPurchase } from "@/types/purchase";
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
import { useRequestsAPI, PurchaseAPIResponse } from "@/hooks/usePurchasesAPI";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface RequestsTableProps {
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const getStatusBadgeProps = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "approved":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getUrgencyBadgeProps = (urgency: string) => {
  switch (urgency.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Transform API data to table format
const transformAPIDataToTable = (apiData: PurchaseAPIResponse[]): RequestPurchase[] => {
  return apiData.map(item => ({
    id: item.id,
    date: new Date(item.date),
    number: item.number,
    dueDate: item.due_date ? new Date(item.due_date) : undefined,
    status: item.status as any,
    amount: item.grand_total || item.amount,
    type: "request" as const,
    items: item.items || [],
    requestedBy: (item as any).requested_by || '',
    urgency: (item as any).urgency || 'Medium'
  }));
};

export function RequestsTable({ 
  onDelete, 
  onEdit,
  onApprove,
  onReject
}: RequestsTableProps) {
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
  } = useRequestsAPI();

  // Transform API data to table format
  const requests = transformAPIDataToTable(apiData);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (requestToDelete) {
      onDelete?.(requestToDelete);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setRequestToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requested</TableHead>
              <TableHead>Request #</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Loading requests...</span>
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
              <TableHead>Requested</TableHead>
              <TableHead>Request #</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requested</TableHead>
              <TableHead>Request #</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.date.toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => window.location.href = `/request/${request.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {request.number}
                    </button>
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>
                    <Badge className={getUrgencyBadgeProps(request.urgency)}>
                      {request.urgency === "High" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.dueDate ? request.dueDate.toLocaleDateString('en-GB') : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeProps(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    Rp {formatPriceWithSeparator(request.amount)}
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
                        <DropdownMenuItem onClick={() => window.location.href = `/request/${request.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {request.status === "pending" && onApprove && onReject && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => onApprove(request.id)}
                              className="text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onReject(request.id)}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(request.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(request.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {requests.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={apiData.length * totalPages}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleLimitChange}
          itemsPerPageOptions={[5, 10, 20, 50]}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this request?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>No</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}