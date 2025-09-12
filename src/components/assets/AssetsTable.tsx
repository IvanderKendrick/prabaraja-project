import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Trash, MoreHorizontal, Laptop, Armchair, Car, Box } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UIAsset } from "@/pages/Assets";

interface AssetsTableProps {
  itemsPerPage: number;
  search: string;
  assets: UIAsset[];
  onDeleteAsset: (id: string) => void;
  onSellAsset: (asset: UIAsset) => void;
  isAdmin: boolean;
}

export const AssetsTable = ({ 
  itemsPerPage, 
  search, 
  assets, 
  onDeleteAsset, 
  onSellAsset,
  isAdmin 
}: AssetsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAssetIcon = (type: UIAsset["type"]) => {
    switch (type) {
      case "computer": return <Laptop className="h-4 w-4" />;
      case "furniture": return <Armchair className="h-4 w-4" />;
      case "vehicle": return <Car className="h-4 w-4" />;
      default: return <Box className="h-4 w-4" />;
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(search.toLowerCase()) ||
    asset.tag.toLowerCase().includes(search.toLowerCase()) ||
    asset.assignedTo.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDelete = (id: string) => {
    onDeleteAsset(id);
    toast.success("Asset deleted successfully");
  };

  if (filteredAssets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No assets found. Try adjusting your search or add a new asset.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Tag</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Asset Detail</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAssets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.tag}</TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getAssetIcon(asset.type)}
                  {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{asset.name}</div>
                <div className="text-sm text-muted-foreground">{asset.model}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={asset.assignedTo.avatar} />
                    <AvatarFallback>
                      {asset.assignedTo.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{asset.assignedTo.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {asset.assignedTo.department}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {new Date(asset.purchaseDate).toLocaleDateString()}
                  {new Date(asset.warrantyDeadline) > new Date() ? (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{formatCurrency(asset.currentValue)}</div>
                <div className="text-sm text-muted-foreground">
                  {((asset.currentValue / asset.purchasePrice) * 100).toFixed(0)}% of original
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => onSellAsset(asset)}>
                          Sell Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
