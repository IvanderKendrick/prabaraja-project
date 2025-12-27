import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import axios from "axios";
import { toast } from "sonner";

const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No token found");

  const parsed = JSON.parse(raw);
  if (!parsed.access_token) throw new Error("Token missing");

  return parsed.access_token;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    id: "",
    name: "",
    sku: "",
    category: "",
    unit: "",
    warehouses: "",
    description: "",
    salesAccount: "",
    cogsAccount: "",
  });

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     FETCH PRODUCT DETAIL
  =============================== */
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const token = getAuthToken();

        const response = await axios.get(
          "https://pbw-backend-api.vercel.app/api/products",
          {
            params: {
              action: "getProducts",
              search: id,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        if (!data.error && data.formattedData?.length > 0) {
          const productData = data.formattedData[0];

          setProduct({
            id: productData.id,
            name: productData.name,
            sku: productData.sku,
            category: productData.category,
            unit: productData.unit,
            warehouses: productData.warehouses,
            description: productData.description,
            salesAccount: productData.sales_COA,
            cogsAccount: productData.cogs_COA,
          });

          setItems(
            productData.items_product.map((item: any, index: number) => ({
              id: index + 1,
              coa: item.stock_COA,
              stockName: item.stock_name,
              sellPrice: item.sell_price,
              cogs: item.cogs,
            }))
          );
        }
      } catch (error: any) {
        console.error("Failed to fetch product:", error);

        if (error.message === "No token found") {
          alert("Session expired. Please login again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ===============================
     HANDLERS
  =============================== */
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        coa: "",
        stockName: "",
        sellPrice: 0,
        cogs: 0,
      },
    ]);
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = async () => {
    try {
      const token = getAuthToken();

      const payload = {
        action: "editProduct",
        id: product.id,
        category: product.category,
        name: product.name,
        unit: product.unit,
        sku: product.sku,
        warehouses: product.warehouses,
        description: product.description,
        sales_COA: product.salesAccount,
        cogs_COA: product.cogsAccount,
        // aku hapus acc_info
        items_product: items.map((item) => ({
          stock_COA: item.coa,
          stock_name: item.stockName,
          sell_price: item.sellPrice,
          cogs: item.cogs,
        })),
      };

      const response = await axios.put(
        "https://pbw-backend-api.vercel.app/api/products",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.error) {
        toast.success(response.data.message || "Product updated successfully");
      } else {
        toast.error("Failed to update product");
      }
    } catch (error: any) {
      console.error("Update product error:", error);

      if (error.message === "No token found") {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Something went wrong while updating product");
      }
    } finally {
      navigate("/inventory/product");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-sm text-gray-600">Loading product detail...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header
          title="Product Detail"
          description="Manage your product information and related accounts"
        />

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <Input disabled value={product.name} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <Input disabled value={product.sku} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <Input disabled value={product.category} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Unit
                </label>
                <Input disabled value={product.unit} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Warehouses
                </label>
                <Input disabled value={product.warehouses} />
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

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sales <span className="text-red-500 ml-1">*</span>
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
                  Cost of Goods Sold{" "}
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

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">Items</h2>
              <Button
                onClick={handleAddItem}
                className="bg-sidebar-active hover:bg-green-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>COA</TableHead>
                  <TableHead>Stock Name</TableHead>
                  <TableHead>Sell Price</TableHead>
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
                          handleItemChange(item.id, "stockName", e.target.value)
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
