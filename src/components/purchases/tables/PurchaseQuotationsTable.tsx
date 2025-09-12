import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { QuotationPurchase } from "@/types/purchase";

interface PurchaseQuotationsTableProps {
  quotations: QuotationPurchase[];
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

const isExpired = (validUntil: Date) => {
  return new Date() > new Date(validUntil);
};

export function PurchaseQuotationsTable({ 
  quotations, 
  onEdit, 
  onDelete, 
  onView 
}: PurchaseQuotationsTableProps) {
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
                    onClick={() => window.location.href = `/purchase-quotation/${quotation.id}`}
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
  );
}