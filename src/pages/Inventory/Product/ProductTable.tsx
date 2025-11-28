import { useState } from "react";
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
import { MoreHorizontal, Eye, Trash2, Plus } from "lucide-react";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { useNavigate } from "react-router-dom";

export default function ProductTable() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Karton Box Besar",
      category: "Packaging",
      unit: "pcs",
      salePrice: 8000,
      cogs: 5000,
    },
    {
      id: 2,
      name: "Botol Plastik 500ml",
      category: "Container",
      unit: "pcs",
      salePrice: 6000,
      cogs: 3500,
    },
    {
      id: 3,
      name: "Label Produk Premium",
      category: "Printing",
      unit: "roll",
      salePrice: 20000,
      cogs: 12000,
    },
  ]);

  const handleView = (id: number) => {
    navigate(`/inventory/product/${id}`);
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* ===== Summary Card ===== */}
      <Card className="bg-indigo-50 border-indigo-100">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-indigo-700">
            Available Stock Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-indigo-900">
            {products.length} Products
          </p>
        </CardContent>
      </Card>

      {/* ===== Add Button ===== */}
      <div className="flex justify-end">
        <Button
          className="bg-sidebar-active hover:bg-green-600 text-white"
          onClick={() => navigate("/inventory/product/add")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* ===== Table ===== */}
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
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleView(product.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600"
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
    </div>
  );
}
