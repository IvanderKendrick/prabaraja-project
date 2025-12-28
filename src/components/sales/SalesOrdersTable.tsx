import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSalesOrdersAPI, SalesAPIResponse } from "@/hooks/useSalesAPI";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface SalesOrdersTableProps {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const transformAPIDataToTable = (apiData: SalesAPIResponse[]) => {
  return apiData.map((item) => ({
    id: item.id,
    orderDate: item.order_date ? new Date(item.order_date) : new Date(),
    number: item.number,
    orderedBy: item.customer_name,
    urgency: item.level || "-",
    status: item.status || "-",
    dueDate: item.due_date ? new Date(item.due_date) : undefined,
    amount: typeof item.grand_total === "string" ? parseFloat(item.grand_total) || 0 : item.grand_total ?? 0,
    installmentAmount: typeof item.unearned_revenue_amount === "string" ? parseFloat(item.unearned_revenue_amount) || 0 : item.unearned_revenue_amount ?? 0,
  }));
};

export function SalesOrdersTable({ onView, onEdit, onDelete }: SalesOrdersTableProps) {
  const { data: apiData, isLoading, error, page, limit, totalPages, total, handlePageChange, handleLimitChange, refresh } = useSalesOrdersAPI();
  const orders = transformAPIDataToTable(apiData);

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
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Installment Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Loading orders...</span>
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
              <TableHead>Order Date</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Installment Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
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
              <TableHead>Order Date</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Installment Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderDate.toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>
                    <button onClick={() => (window.location.href = `/sales-order/${order.id}`)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      {order.number}
                    </button>
                  </TableCell>
                  <TableCell>{order.orderedBy}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getUrgencyColor(order.urgency))}>{order.urgency}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusColor(order.status))}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.dueDate ? order.dueDate.toLocaleDateString("en-GB") : "-"}</TableCell>
                  <TableCell className="font-medium">Rp {formatPriceWithSeparator(order.amount)}</TableCell>
                  <TableCell className="font-medium">Rp {formatPriceWithSeparator(order.installmentAmount)}</TableCell>
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
                            onView?.(order.id);
                            window.location.href = `/sales-order/${order.id}`;
                          }}
                          className="flex items-center cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(order.id)} className="flex items-center cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete?.(order.id)} className="flex items-center cursor-pointer text-red-600">
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
