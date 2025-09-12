import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { useProductCategories } from "@/hooks/useProductCategories";
import { Loader2, ArrowLeft } from "lucide-react";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { categories } = useProductCategories();
  const updateProductMutation = useUpdateProduct();

  const [formData, setFormData] = useState({
    category: "",
    total_stock: 0,
    min_stock: 0,
    buy_price: 0,
    sell_price: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Find the product to edit
  const product = products?.find((p) => p.id === id);

  useEffect(() => {
    if (product) {
      setFormData({
        category: product.category,
        total_stock: product.total_stock,
        min_stock: product.min_stock,
        buy_price: product.buy_price,
        sell_price: product.sell_price || 0,
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Product ID is required");
      return;
    }

    // Validation
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (formData.total_stock < 0 || formData.min_stock < 0) {
      toast.error("Stock values cannot be negative");
      return;
    }

    if (formData.buy_price <= 0) {
      toast.error("Buy price must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      await updateProductMutation.mutateAsync({
        id,
        updates: {
          category: formData.category,
          total_stock: formData.total_stock,
          min_stock: formData.min_stock,
          buy_price: formData.buy_price,
          sell_price: formData.sell_price,
          status:
            formData.total_stock < formData.min_stock
              ? "Out of Stock"
              : "In Stock",
        },
      });

      toast.success("Product updated successfully");
      navigate("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!id) {
    return <div>Invalid product ID</div>;
  }

  if (productsLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-2xl mx-auto">
            <div className="text-center">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-2xl mx-auto">
            <div className="text-center text-red-500">Product not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/products")}
            className="bg-white hover:bg-white/10 rounded-md p-2 mr-4"
            aria-label="Back to Products"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold ">Edit Product</h2>
            <p className="">Update product information</p>
          </div>
        </div>
        <div className="p-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Code and Name (read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Product Code</Label>
                    <Input
                      value={`P${product.number.toString().padStart(3, "0")}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label>Product Name</Label>
                    <Input value={product.name} disabled className="bg-muted" />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_stock">Total Stock *</Label>
                    <Input
                      id="total_stock"
                      type="number"
                      value={formData.total_stock}
                      onChange={(e) =>
                        handleInputChange(
                          "total_stock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_stock">Min Stock *</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      value={formData.min_stock}
                      onChange={(e) =>
                        handleInputChange(
                          "min_stock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Unit (read-only) */}
                <div>
                  <Label>Unit</Label>
                  <Input value={product.unit} disabled className="bg-muted" />
                </div>

                {/* Price Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buy_price">Buy Price *</Label>
                    <Input
                      id="buy_price"
                      type="number"
                      step="0.01"
                      value={formData.buy_price}
                      onChange={(e) =>
                        handleInputChange(
                          "buy_price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sell_price">Sell Price</Label>
                    <Input
                      id="sell_price"
                      type="number"
                      step="0.01"
                      value={formData.sell_price}
                      onChange={(e) =>
                        handleInputChange(
                          "sell_price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/products")}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Product
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
