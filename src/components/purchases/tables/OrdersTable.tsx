import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  AlertTriangle,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderPurchase } from "@/types/purchase";
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
import { useOrdersAPI, PurchaseAPIResponse } from "@/hooks/usePurchasesAPI";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

// interface OrdersTableProps {
//   onDelete?: (id: string) => void;
//   onEdit?: (id: string) => void;
// }

// const getStatusBadgeProps = (status: string) => {
//   switch (status.toLowerCase()) {
//     case "completed":
//       return "bg-green-100 text-green-800 border-green-200";
//     case "pending":
//       return "bg-amber-100 text-amber-800 border-amber-200";
//     case "cancelled":
//       return "bg-red-100 text-red-800 border-red-200";
//     default:
//       return "bg-gray-100 text-gray-800 border-gray-200";
//   }
// };

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
const transformAPIDataToTable = (
  apiData: PurchaseAPIResponse[]
): OrderPurchase[] => {
  return apiData.map((item) => ({
    id: item.id,
    date: new Date(item.date),
    number: item.number,
    orderDate: item.orders_date
      ? new Date(item.orders_date)
      : new Date(item.date),
    orderedBy: item.ordered_by || "",
    dueDate: item.due_date ? new Date(item.due_date) : undefined,
    // status: item.status as any,
    amount: item.grand_total || item.amount,
    installmentAmount: item.installment_amount || "-",
    type: "order" as const,
    items: item.items || [],
    urgency: (item as any).urgency || "Medium",
    approver: (item as any).approver || "",
    tags: (item as any).tags || [],
    itemCount: Array.isArray(item.items) ? item.items.length : 0,
  }));
};

// export function OrdersTable({ onDelete, onEdit }: OrdersTableProps) {

interface OrdersTableProps {
  onView?: (id: string) => void;
}

export function OrdersTable({ onView }: OrdersTableProps) {
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
    refresh,
  } = useOrdersAPI();

  // Transform API data to table format
  const orders = transformAPIDataToTable(apiData);

  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // const handleDeleteClick = (id: string) => {
  //   setOrderToDelete(id);
  //   setDeleteDialogOpen(true);
  // };

  // const confirmDelete = () => {
  //   if (orderToDelete) {
  //     onDelete?.(orderToDelete);
  //   }
  //   setDeleteDialogOpen(false);
  // };

  // const cancelDelete = () => {
  //   setOrderToDelete(null);
  //   setDeleteDialogOpen(false);
  // };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Due Date</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead>Amount</TableHead>
              <TableHead>Installment Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Loading orders...
                  </span>
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
              <TableHead>Order Date</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Urgency</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Installment Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
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
              <TableHead>Order Date</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Due Date</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead>Amount</TableHead>
              <TableHead>Installment Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.orderDate.toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        (window.location.href = `/order/${order.id}`)
                      }
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {order.number}
                    </button>
                  </TableCell>
                  <TableCell>{order.orderedBy}</TableCell>
                  {/* <TableCell>{order.items.length}</TableCell> */}
                  <TableCell>
                    <Badge className={getUrgencyBadgeProps(order.urgency)}>
                      {order.urgency === "High" && (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {order.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn("text-red-500 font-medium")}>
                    {order.dueDate
                      ? order.dueDate.toLocaleDateString("en-GB")
                      : "-"}
                  </TableCell>
                  {/* <TableCell>
                    <Badge className={getStatusBadgeProps(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell> */}
                  <TableCell className="font-medium">
                    Rp {formatPriceWithSeparator(order.amount)}
                  </TableCell>
                  <TableCell className="font-medium">
                    Rp {formatPriceWithSeparator(order.installmentAmount)}
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
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(order.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        )}
                        {/* {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(order.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(order.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )} */}
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
      {orders.length > 0 && (
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
      {/* <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order.
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
      </AlertDialog> */}
    </div>
  );
}
