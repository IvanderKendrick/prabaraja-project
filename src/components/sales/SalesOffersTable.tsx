import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Loader2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSalesOffersAPI, SalesAPIResponse } from "@/hooks/useSalesAPI";
import { Pagination } from "@/components/Pagination";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface SalesOffersTableProps {
  onView?: (id: string) => void;
}

// Transform API data to table format
const transformAPIDataToTable = (apiData: SalesAPIResponse[]) => {
  return apiData.map((item) => ({
    id: item.id,
    // Use offer_date from API for display date
    date: item.offer_date ? new Date(item.offer_date as string) : new Date(),
    number: item.number,
    customerName: item.customer_name,
    startDate: item.start_date ? new Date(item.start_date) : undefined,
    expiryDate: item.valid_until ? new Date(item.valid_until as string) : undefined,
    discountTerms: item.terms || item.discount_terms || "",
    amount: item.total ?? item.grand_total ?? item.amount ?? 0,
    items: item.items || [],
    itemCount: Array.isArray(item.items) ? item.items.length : 0,
  }));
};

export function SalesOffersTable({ onView }: SalesOffersTableProps) {
  const { data: apiData, isLoading, error, page, limit, totalPages, total, handlePageChange, handleLimitChange, refresh } = useSalesOffersAPI();

  // Transform API data to table format
  const offers = transformAPIDataToTable(apiData);

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offer Date</TableHead>
              <TableHead>Offer Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Discount Terms</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Loading offers...</span>
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
              <TableHead>Offer Date</TableHead>
              <TableHead>Offer Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Discount Terms</TableHead>
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
              <TableHead>Offer Date</TableHead>
              <TableHead>Offer Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Discount Terms</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No offers found
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.date.toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>
                    <button onClick={() => (window.location.href = `/sales-offer/${offer.id}`)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      {offer.number}
                    </button>
                  </TableCell>
                  <TableCell>{offer.customerName}</TableCell>
                  <TableCell className={cn("text-gray-900")}>{offer.startDate ? new Date(offer.startDate).toLocaleDateString("en-GB") : "-"}</TableCell>
                  <TableCell className={cn("text-red-500 font-medium")}>{offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString("en-GB") : "-"}</TableCell>
                  <TableCell>{offer.discountTerms}</TableCell>
                  <TableCell className="font-medium">Rp {formatPriceWithSeparator(offer.amount)}</TableCell>
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
                            onView?.(offer.id);
                            window.location.href = `/sales-offer/${offer.id}`;
                          }}
                          className="flex items-center cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
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
