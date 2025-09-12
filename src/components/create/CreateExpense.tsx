import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/types/expense";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateExpense } from "@/hooks/useExpenses";

const CATEGORIES_STORAGE_KEY = "expense_categories";

interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  amount: number;
}

type ExpenseStatus = "Paid" | "Require Approval";

const CreateExpense = () => {
  const navigate = useNavigate();
  const createExpenseMutation = useCreateExpense();

  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] = useState<string>(
    DEFAULT_EXPENSE_CATEGORIES[0]
  );
  const [beneficiary, setBeneficiary] = useState<string>("");
  const [status, setStatus] = useState<ExpenseStatus>("Require Approval");
  const [items, setItems] = useState<ExpenseItem[]>([
    { id: uuidv4(), name: "", quantity: 1, amount: 0 },
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<string[]>(() => {
    const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    return storedCategories
      ? JSON.parse(storedCategories)
      : DEFAULT_EXPENSE_CATEGORIES;
  });

  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), name: "", quantity: 1, amount: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof ExpenseItem,
    value: any
  ) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "amount"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !category || !beneficiary) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (items.some((item) => !item.name || item.amount <= 0)) {
      toast.error("Please fill in all item details with valid amounts");
      return;
    }

    const totalAmount = calculateTotal();

    const newExpense = {
      date: date,
      number: Math.floor(10000 + Math.random() * 90000),
      category,
      beneficiary,
      status,
      items,
      grand_total: totalAmount,
    };

    try {
      await createExpenseMutation.mutateAsync(newExpense);
      toast.success("Expense created successfully");
      navigate("/expenses");
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Failed to create expense");
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(updatedCategories)
    );
    setCategory(newCategory.trim());
    setNewCategory("");
    toast.success("Category added successfully");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-8">
          <h1 className="text-2xl font-semibold">Create New Expense</h1>
        </div>

        <div className="p-6">
          <Link to="/expenses" className="inline-block mb-6">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Expenses
            </Button>
          </Link>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="Enter category name"
                            />
                            <Button
                              onClick={handleAddCategory}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" /> Add Category
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Beneficiary
                    </label>
                    <input
                      type="text"
                      value={beneficiary}
                      onChange={(e) => setBeneficiary(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter beneficiary name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <Select
                      value={status}
                      onValueChange={(value: ExpenseStatus) => setStatus(value)}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="[&_[data-state=checked]]:bg-gray-100">
                        <SelectItem value="Require Approval">
                          <div className="flex items-center gap-2 text-amber-600">
                            <Clock className="h-4 w-4" />
                            Require Approval
                          </div>
                        </SelectItem>
                        <SelectItem value="Paid">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Paid
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Expense Items</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-4 items-center"
                      >
                        <div className="col-span-5">
                          <label className="block text-sm font-medium mb-1">
                            Item Description
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(item.id, "name", e.target.value)
                            }
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter item description"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-sm font-medium mb-1">
                            Unit Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              Rp
                            </span>
                            <input
                              type="number"
                              value={item.amount}
                              min="0"
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded-md pl-10"
                              placeholder="0"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 h-9 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddItem}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add Item
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total:</span>
                    <span className="text-xl font-bold">
                      Rp. {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => navigate("/expenses")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className=" text-white"
                    disabled={createExpenseMutation.isPending}
                  >
                    {createExpenseMutation.isPending
                      ? "Saving..."
                      : "Save Expense"}
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

export default CreateExpense;
