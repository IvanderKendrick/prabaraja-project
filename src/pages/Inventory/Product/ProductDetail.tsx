import { useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState({
    id,
    name: "Karton Box Besar",
    sku: "PKG-001",
    category: "Packaging",
    unit: "pcs",
    warehouses: "Gudang Utama",
    description: "Karton besar untuk kemasan produk ukuran 1L.",
    salesAccount: "Sales Product A",
    cogsAccount: "COGS Product A",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      coa: "5010",
      stockName: "Karton Box Besar",
      sellPrice: 8000,
      cogs: 5000,
    },
  ]);

  const handleAddItem = () => {
    const newItem = {
      id: items.length + 1,
      coa: "",
      stockName: "",
      sellPrice: 0,
      cogs: 0,
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveProduct = () => {
    console.log("Save clicked:", product, items);
    alert("Product saved! (API integration later)");
  };

  const handleInputChange = (field: string, value: string) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Header
          title="Product Detail"
          description="Manage your product information and related accounts"
        />

        <div className="p-6 space-y-6">
          {/* ===== Product Info Card ===== */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <Input
                  disabled
                  value={product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <Input
                  disabled
                  value={product.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <Input
                  disabled
                  value={product.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Unit
                </label>
                <Input
                  disabled
                  value={product.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Warehouses
                </label>
                <Input
                  disabled
                  value={product.warehouses}
                  onChange={(e) =>
                    handleInputChange("warehouses", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  rows={3}
                  value={product.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* ===== Account Info Card ===== */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sales
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  value={product.salesAccount}
                  onChange={(e) =>
                    handleInputChange("salesAccount", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cost of Goods Sold
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  value={product.cogsAccount}
                  onChange={(e) =>
                    handleInputChange("cogsAccount", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* ===== Items Table ===== */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Items</h2>
              <Button
                className="bg-sidebar-active hover:bg-green-600 text-white"
                onClick={handleAddItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>COA</TableHead>
                    <TableHead>Stock Name</TableHead>
                    <TableHead>
                      Sell Price <span className="text-red-500">*</span>
                    </TableHead>
                    <TableHead>COGS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={item.coa}
                          onChange={(e) =>
                            handleItemChange(item.id, "coa", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.stockName}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "stockName",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.sellPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "sellPrice",
                              Number(e.target.value)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.cogs}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "cogs",
                              Number(e.target.value)
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ===== Save Button ===== */}
          <div className="flex justify-end">
            <Button
              className="bg-sidebar-active hover:bg-green-600 text-white"
              onClick={handleSaveProduct}
            >
              Save Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
