import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useProducts, useCreateProduct } from "@/hooks/useProducts";
import { useProductCategories } from "@/hooks/useProductCategories";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const unitOptions = ["Unit", "pcs", "box", "set", "pack"];

const AddProduct = () => {
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const createProductMutation = useCreateProduct();

  // Generate next product number based on existing products
  const nextProductNumber =
    products.length > 0 ? Math.max(...products.map((p) => p.number)) + 1 : 1;

  const productCode = `PRD${nextProductNumber.toString().padStart(3, "0")}`;

  const [category, setCategory] = useState("Electronics");
  const [name, setName] = useState("");
  const [totalStock, setTotalStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [unit, setUnit] = useState(unitOptions[0]);
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const { categories, addCategory, deleteCategory, getAllCategoryNames } =
    useProductCategories();
  const productCategories = getAllCategoryNames();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !totalStock || !minStock || !buyPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        number: nextProductNumber,
        category,
        name,
        total_stock: parseInt(totalStock),
        min_stock: parseInt(minStock),
        unit,
        buy_price: parseFloat(buyPrice),
        sell_price: sellPrice ? parseFloat(sellPrice) : null,
        status:
          parseInt(totalStock) < parseInt(minStock)
            ? "Out of Stock"
            : "In Stock",
      });

      toast.success("Product added successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to add product. Please try again.");
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const success = addCategory(newCategoryName);
    if (success) {
      toast.success(`Category "${newCategoryName}" added successfully!`);
      setCategory(newCategoryName);
      setNewCategoryName("");
      setShowAddCategory(false);
    } else {
      toast.error("Category already exists");
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    const result = deleteCategory(categoryName);
    if (result.success) {
      toast.success(result.message);
      if (category === categoryName) {
        setCategory(
          productCategories.find((c) => c !== categoryName) || "Electronics"
        );
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Add New Product" description="Fill out the form to add a product." />
        <div className="p-6">
          <Card className="w-full">
            <CardContent className="p-6">
              <form
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                onSubmit={handleSubmit}
              >
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Product Code
                  </label>
                  <Input value={productCode} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Category
                  </label>
                  <div className="space-y-2">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map((cat) => (
                          <SelectItem value={cat} key={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {showAddCategory ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter new category"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddCategory()
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddCategory}
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategoryName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCategory(true)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Category
                      </Button>
                    )}

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">
                        Manage Categories:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {categories.map((cat) => (
                          <div
                            key={cat.name}
                            className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs"
                          >
                            <span>
                              {cat.name} ({cat.productCount})
                            </span>
                            {cat.productCount === 0 &&
                              !["Electronics", "Office", "Furniture"].includes(
                                cat.name
                              ) && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button className="text-red-500 hover:text-red-700">
                                      <Trash2 size={12} />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Category
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete the
                                        category "{cat.name}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteCategory(cat.name)
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Name *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">
                      Total Stock *
                    </label>
                    <Input
                      type="number"
                      value={totalStock}
                      min={0}
                      onChange={(e) => setTotalStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">
                      Min Stock *
                    </label>
                    <Input
                      type="number"
                      value={minStock}
                      min={0}
                      onChange={(e) => setMinStock(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Unit
                  </label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((opt) => (
                        <SelectItem value={opt} key={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Buy Price *
                  </label>
                  <Input
                    type="number"
                    value={buyPrice}
                    min={0}
                    step="0.01"
                    onChange={(e) => setBuyPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Sell Price
                  </label>
                  <Input
                    type="number"
                    value={sellPrice}
                    min={0}
                    step="0.01"
                    onChange={(e) => setSellPrice(e.target.value)}
                  />
                </div>
                <div className="lg:col-span-2 flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/products")}
                    disabled={createProductMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Product"
                    )}
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

export default AddProduct;
