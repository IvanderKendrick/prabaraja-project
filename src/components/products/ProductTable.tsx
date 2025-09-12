
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Product } from "@/types/products";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "sonner";

interface ProductTableProps {
  products: Product[];
}

interface ProductWithId {
  id?: string;
  code: string;
  category: string;
  name: string;
  totalStock: number;
  minStock: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  status: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const navigate = useNavigate();
  const deleteProductMutation = useDeleteProduct();

  const handleEdit = (product: ProductWithId) => {
    navigate(`/edit-product/${product.id}`);
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteProductId(productId);
  };

  const handleDeleteConfirm = async () => {
    if (deleteProductId) {
      try {
        await deleteProductMutation.mutateAsync(deleteProductId);
        toast.success("Product deleted successfully");
        setDeleteProductId(null);
      } catch (error) {
        toast.error("Failed to delete product");
        console.error("Delete error:", error);
      }
    }
  };

  // Auto-set status based on stock levels
  const getAutoStatus = (totalStock: number, minStock: number) => {
    return totalStock < minStock ? "Out of Stock" : "In Stock";
  };
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No products found. Try adjusting your search or add a new product.
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Code</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Total Stock</TableHead>
            <TableHead>Min Stock</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Buy Price</TableHead>
            <TableHead>Sell Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const autoStatus = getAutoStatus(product.totalStock, product.minStock);
            return (
              <TableRow key={product.code}>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.totalStock}</TableCell>
                <TableCell>{product.minStock}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{formatCurrency(product.buyPrice)}</TableCell>
                <TableCell>{formatCurrency(product.sellPrice)}</TableCell>
                <TableCell>
                  <span
                    className={`flex items-center gap-2 ${
                      autoStatus === "In Stock" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {autoStatus === "In Stock" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {autoStatus}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(product as ProductWithId)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick((product as ProductWithId).id || "")}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
