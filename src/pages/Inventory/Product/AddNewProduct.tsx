import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function AddNewProduct() {
  const [headerTitle] = useState("Add New Product");
  const [headerDescription] = useState(
    "Create a new product and set its accounts and pricing."
  );
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    warehouses: "",
    desc: "",
    salesAccount: "",
    cogsAccount: "",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      coa: "COA001",
      stockName: "Example Item",
      sellPrice: 50000,
      cogs: 40000,
    },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSave = () => {
    console.log("Saving Product:", product);
    console.log("Items:", items);
    // TODO: Tambahkan pemanggilan API untuk menyimpan produk
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar kiri */}
      <Sidebar />

      {/* Konten kanan */}
      <div className="flex-1 overflow-auto ">
        <Header title={headerTitle} description={headerDescription} />

        <div className="p-6 space-y-8">
          {/* Product Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Product Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <Input
                  value={product.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <Input
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
                  value={product.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Warehouses
                </label>
                <Input
                  value={product.warehouses}
                  onChange={(e) =>
                    handleInputChange("warehouses", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  value={product.desc}
                  onChange={(e) => handleInputChange("desc", e.target.value)}
                  placeholder="Enter product description..."
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sales <span className="text-red-500">*</span>
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
                  Cost of Goods Sold <span className="text-red-500">*</span>
                </label>
                <Input
                  value={product.cogsAccount}
                  onChange={(e) =>
                    handleInputChange("cogsAccount", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Item Table */}
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              className="bg-sidebar-active hover:bg-green-600 text-white px-6 py-2"
              onClick={handleSave}
            >
              Save Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
