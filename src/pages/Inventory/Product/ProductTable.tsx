import { useState, useEffect } from "react";
import axios from "axios";

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

import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  MoreHorizontal,
  Eye,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ======================================================
// GET TOKEN FROM LOCAL STORAGE
// ======================================================
const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No token found");

  const parsed = JSON.parse(raw);
  if (!parsed.access_token) throw new Error("Token missing");

  return parsed.access_token;
};

export default function ProductTable() {
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!selectedProductId) return;

    await handleDelete(selectedProductId);

    setDeleteDialogOpen(false);
    setSelectedProductId(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedProductId(null);
  };

  // ======================================================
  // FETCH PRODUCT DATA
  // ======================================================
  const fetchProducts = async () => {
    try {
      const token = getAuthToken();

      const response = await axios.get(
        "https://pbw-backend-api.vercel.app/api/products?action=getProducts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apiData = response.data.formattedData ?? [];

      // MAP API → TABLE FORMAT
      const mapped = apiData.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category ?? "-",
        unit: item.unit ?? "-",

        salePrice: item.items_product?.sell_price ?? 0,
        cogs: item.items_product?.cogs ?? 0,
      }));

      setProducts(mapped);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      setError("Failed to load product data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ======================================================
  // DELETE PRODUCT (API + UPDATE STATE)
  // ======================================================
  const handleDelete = async (id: string) => {
    try {
      const token = getAuthToken();

      await axios.delete("https://pbw-backend-api.vercel.app/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          action: "deleteProduct",
          id: id,
        },
      });

      // update state setelah API sukses
      setProducts((prev) => prev.filter((p) => p.id !== id));

      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.success("Failed to delete product:", error.response?.data || error);
    }
  };

  const handleView = (id: string) => {
    navigate(`/inventory/product/${id}`);
  };

  // ======================================================
  // LOADING UI
  // ======================================================
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>COGS</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Loading products...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // ======================================================
  // ERROR UI
  // ======================================================
  if (error) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>COGS</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>

                  <Button variant="outline" size="sm" onClick={fetchProducts}>
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

  // ======================================================
  // MAIN RENDER
  // ======================================================
  return (
    <div className="space-y-6">
      {/* SUMMARY CARD */}
      <Card className="bg-indigo-50 border-indigo-100">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-indigo-700">
            Available Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-indigo-900">
            {products.length} Products
          </p>
        </CardContent>
      </Card>

      {/* ADD NEW PRODUCT BUTTON */}
      <div className="flex justify-end">
        <Button
          className="bg-sidebar-active hover:bg-green-600 text-white"
          onClick={() => navigate("/inventory/product/add")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* TABLE */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>COGS</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.unit}</TableCell>

                <TableCell>
                  Rp {formatPriceWithSeparator(product.salePrice)}
                </TableCell>

                <TableCell>
                  Rp {formatPriceWithSeparator(product.cogs)}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleView(product.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product.
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
