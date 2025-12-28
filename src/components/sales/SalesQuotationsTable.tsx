import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Edit, Trash, Loader2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSalesQuotationsAPI, SalesAPIResponse } from "@/hooks/useSalesAPI";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface SalesQuotationsTableProps {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Transform API data to table format
const transformAPIDataToTable = (apiData: SalesAPIResponse[]) => {
  return apiData.map((item) => ({
    id: item.id,
    // Use quotation_date from API for display date
    date: item.quotation_date ? new Date(item.quotation_date as string) : new Date(),
    number: item.number,
    customerName: item.customer_name,
    startDate: item.start_date ? new Date(item.start_date) : undefined,
    validUntil: item.valid_until ? new Date(item.valid_until as string) : undefined,
    status: item.status || "Sent",
    amount: item.total ?? item.grand_total ?? item.amount ?? 0,
    items: item.items || [],
    itemCount: Array.isArray(item.items) ? item.items.length : 0,
  }));
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "approved":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending":
    case "sent":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "draft":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
  }
};

export function SalesQuotationsTable({ onView, onEdit, onDelete }: SalesQuotationsTableProps) {
  const { data: apiData, isLoading, error, page, limit, totalPages, total, handlePageChange, handleLimitChange, refresh } = useSalesQuotationsAPI();

  // Transform API data to table format
  const quotations = transformAPIDataToTable(apiData);

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation Date</TableHead>
              <TableHead>Quotation Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Valid Until</TableHead>
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
                  <span className="text-sm text-gray-500">Loading quotations...</span>
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
              <TableHead>Quotation Date</TableHead>
              <TableHead>Quotation Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Valid Until</TableHead>
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
              <TableHead>Quotation Date</TableHead>
              <TableHead>Quotation Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No quotations found
                </TableCell>
              </TableRow>
            ) : (
              quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.date.toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>
                    <button onClick={() => (window.location.href = `/sales-quotation/${quotation.id}`)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      {quotation.number}
                    </button>
                  </TableCell>
                  <TableCell>{quotation.customerName}</TableCell>
                  <TableCell className={cn("text-gray-900")}>{quotation.startDate ? new Date(quotation.startDate).toLocaleDateString("en-GB") : "-"}</TableCell>
                  <TableCell className={cn("text-gray-900")}>{quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-GB") : "-"}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusColor(quotation.status))}>{quotation.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">Rp {formatPriceWithSeparator(quotation.amount)}</TableCell>
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
                            onView?.(quotation.id);
                            window.location.href = `/sales-quotation/${quotation.id}`;
                          }}
                          className="flex items-center cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onEdit?.(quotation.id);
                            window.location.href = `/sales-quotation/edit/${quotation.id}`;
                          }}
                          className="flex items-center cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete?.(quotation.id)} className="flex items-center cursor-pointer text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
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
