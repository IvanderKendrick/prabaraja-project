import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { QuotationPurchase } from "@/types/purchase";
import { usePurchaseQuotationsAPI, QuotationAPIResponse } from "@/hooks/usePurchaseQuotationsAPI";
import { Pagination } from "@/components/Pagination";
import { useNavigate } from "react-router-dom";

interface PurchaseQuotationsTableProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const getStatusBadgeProps = (status: string) => {
  switch (status.toLowerCase()) {
    case "sent":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "accepted":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "expired":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "pending":
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

const isExpired = (validUntil: string | Date) => {
  return new Date() > new Date(validUntil);
};

// Transform API data to table format
const transformAPIDataToTable = (apiData: QuotationAPIResponse[]): QuotationPurchase[] => {
  return apiData.map(item => ({
    id: item.id,
    date: new Date(item.quotation_date),
    number: item.number,
    approver: item.request_by || '',
    status: item.status as any,
    tags: Array.isArray(item.tags) ? item.tags.map(tag => tag.trim()).filter(tag => tag) : [],
    type: "quotation" as const,
    items: item.items || [],
    amount: item.grand_total || item.total,
    itemCount: Array.isArray(item.items) ? item.items.length : 0,
    vendorName: item.vendor_name,
    quotationDate: new Date(item.quotation_date),
    validUntil: new Date(item.valid_until),
    terms: item.terms
  }));
};

export function PurchaseQuotationsTable({ 
  onEdit, 
  onDelete, 
  onView 
}: PurchaseQuotationsTableProps) {
  const navigate = useNavigate();
  const {
    data: apiData,
    isLoading,
    error,
    page,
    limit,
    totalPages,
    handlePageChange,
    handleLimitChange,
    refresh
  } = usePurchaseQuotationsAPI();

  // Transform API data to table format
  const quotations = transformAPIDataToTable(apiData);

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
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
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
              <TableHead>Date</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
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

  // Empty state
  if (quotations.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No purchase quotations found
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
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => {
              const expired = isExpired(quotation.validUntil);
              const displayStatus = expired && quotation.status !== "completed" && quotation.status !== "cancelled" 
                ? "expired" 
                : quotation.status;

              return (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">
                    {quotation.quotationDate.toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => {
                        if (onView) {
                          onView(quotation.id);
                        } else {
                          navigate(`/purchase-quotation/${quotation.id}`);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {quotation.number}
                    </button>
                  </TableCell>
                  <TableCell>{quotation.vendorName}</TableCell>
                  <TableCell>
                    <span className={expired ? "text-red-600 font-medium" : "text-gray-900"}>
                      {quotation.validUntil.toLocaleDateString('en-GB')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeProps(displayStatus)}>
                      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    Rp {formatPriceWithSeparator(quotation.amount)}
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
                          <DropdownMenuItem onClick={() => onView(quotation.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(quotation.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(quotation.id)}
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
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {quotations.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={apiData.length * totalPages} // Approximate total items
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleLimitChange}
          itemsPerPageOptions={[5, 10, 20, 50]}
        />
      )}
    </div>
  );
}