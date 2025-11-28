import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StockDetail() {
  // Header info
  const headerTitle = "Stock Detail";
  const headerDescription = "View and manage specific stock item details.";

  // ======= State untuk stock info =======
  const [stockInfo, setStockInfo] = useState({
    name: "Karton Box Besar",
    sku: "BX-001",
    category: "Packaging",
    unit: "pcs",
    cogs: 5000,
    totalQuantity: 1200,
    totalStockValue: 5000 * 1200,
    minimumStock: 200,
    warehouse: "Gudang A",
    accountName: "Inventory Packaging",
    description: "Karton besar untuk pengiriman produk ukuran besar",
  });

  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    date: new Date().toLocaleDateString("id-ID"),
    number: "ADJ-20251031-001",
    memo: "",
    account: "",
    recordedQty: 1200,
    difference: 0,
    price: 5000,
  });

  const stockHistory = [
    {
      date: "2025-10-10",
      desc: "Penerimaan Barang dari Supplier",
      movement: "+",
      quantity: 300,
      price: 5000,
      total: 1500000,
    },
    {
      date: "2025-10-15",
      desc: "Penjualan ke Customer A",
      movement: "-",
      quantity: 150,
      price: 5000,
      total: 750000,
    },
    {
      date: "2025-10-20",
      desc: "Adjustment Stock (Koreksi)",
      movement: "+",
      quantity: 50,
      price: 5000,
      total: 250000,
    },
  ];

  // Handle perubahan input data
  const handleChange = (field: string, value: string | number) => {
    setStockInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdjustmentChange = (field: string, value: string | number) => {
    setAdjustmentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    console.log("Saving changes:", stockInfo);
  };

  const handleAdjustmentSubmit = () => {
    console.log("Adjustment submitted:", adjustmentData);
    setIsAdjustmentOpen(false);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar kiri */}
      <Sidebar />

      {/* Konten kanan */}
      <div className="flex-1 overflow-auto">
        <Header title={headerTitle} description={headerDescription} />

        <div className="p-6 space-y-6">
          {/* ====== Summary Cards ====== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total Quantity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-blue-900">
                  {stockInfo.totalQuantity.toLocaleString()} {stockInfo.unit}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-100">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-green-700">
                  COGS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-green-900">
                  Rp {stockInfo.cogs.toLocaleString("id-ID")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-100">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-yellow-700">
                  Total Stock (Rp)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-yellow-900">
                  Rp {stockInfo.totalStockValue.toLocaleString("id-ID")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ====== Button Adjustment ====== */}
          <div className="flex justify-end">
            <Button
              className="bg-sidebar-active hover:bg-green-600 text-white"
              onClick={() => setIsAdjustmentOpen(true)}
            >
              Adjustment
            </Button>
          </div>

          {/* ====== Stock Info ====== */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">Stock Name</p>
                <p>{stockInfo.name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">SKU</p>
                <p>{stockInfo.sku}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 mb-1">Category</p>
                <Input
                  value={stockInfo.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                />
              </div>
              <div>
                <p className="font-medium text-gray-600">Unit</p>
                <p>{stockInfo.unit}</p>
              </div>
            </CardContent>
          </Card>

          {/* ====== Track This Item ====== */}
          <Card>
            <CardHeader>
              <CardTitle>Track This Item</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div>
                <p className="font-medium text-gray-600 mb-1">Minimum Stock</p>
                <Input
                  type="number"
                  value={stockInfo.minimumStock}
                  onChange={(e) =>
                    handleChange("minimumStock", Number(e.target.value))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* ====== Warehouse Info ====== */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">Warehouses</p>
                <p>{stockInfo.warehouse}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Account Name</p>
                <p>{stockInfo.accountName}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-medium text-gray-600 mb-3">Description</p>
                <Textarea
                  value={stockInfo.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 sm:col-span-2">
                <Checkbox id="copyToProduct" />
                <label htmlFor="copyToProduct" className="text-sm font-medium">
                  Copy to Product
                </label>
              </div>
            </CardContent>
          </Card>

          {/* ====== Stock History Table ====== */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Movement</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockHistory.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.desc}</TableCell>
                      <TableCell
                        className={
                          item.movement === "+"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {item.movement}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        Rp {item.price.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        Rp {item.total.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ====== Save Button ====== */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveChanges}
              className="bg-sidebar-active hover:bg-green-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* ====== POPUP ADJUSTMENT ====== */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4 text-sm">
            <div>
              <label className="font-medium text-gray-600">Date</label>
              <Input value={adjustmentData.date} disabled />
            </div>
            <div>
              <label className="font-medium text-gray-600">Number</label>
              <Input value={adjustmentData.number} disabled />
            </div>
            <div className="col-span-2">
              <label className="font-medium text-gray-600">Memo</label>
              <Input
                value={adjustmentData.memo}
                onChange={(e) => handleAdjustmentChange("memo", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="font-medium text-gray-600">Account</label>
              <Input
                value={adjustmentData.account}
                onChange={(e) =>
                  handleAdjustmentChange("account", e.target.value)
                }
              />
            </div>
            <div className="col-span-2">
              <label className="font-medium text-gray-600">Recorded Qty</label>
              <Input value={adjustmentData.recordedQty} disabled />
            </div>
            <div>
              <label className="font-medium text-gray-600">Difference</label>
              <Input
                type="number"
                value={adjustmentData.difference}
                onChange={(e) =>
                  handleAdjustmentChange("difference", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="font-medium text-gray-600">Price</label>
              <Input
                value={`Rp ${adjustmentData.price.toLocaleString("id-ID")}`}
                disabled
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="bg-sidebar-active hover:bg-green-600 text-white"
              onClick={handleAdjustmentSubmit}
            >
              Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
