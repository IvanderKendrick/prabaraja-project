import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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
import getAuthToken from "@/utils/getToken";
import { toast } from "sonner";

const getCurrentMonthYear = () => {
  const now = new Date();
  const month = now.toLocaleString("id-ID", { month: "long" });
  const year = now.getFullYear();
  return `${month} ${year}`;
};

const isEndOfMonth = (date = new Date()) => {
  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  return date.getDate() === lastDayOfMonth;
};

export default function StockDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Header info
  const headerTitle = "Stock Detail";
  const headerDescription = "View and manage specific stock item details.";

  // Stock adjustment date validation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // ======= State untuk stock info =======
  const [stockInfo, setStockInfo] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    cogs: 0, // sementara 0
    totalQuantity: 0, // WAJIB default number
    minimumStock: 0,
    warehouse: "",
    accountName: "",
    description: "",
    copyToProduct: false,
  });

  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  // const [adjustmentData, setAdjustmentData] = useState({
  //   date: new Date().toLocaleDateString("id-ID"),
  //   number: "ADJ-20251031-001",
  //   memo: "",
  //   account: "",
  //   recordedQty: 1200,
  //   difference: 0,
  //   price: 5000,
  // });

  const [adjustmentData, setAdjustmentData] = useState({
    date: "", // akan diisi saat dialog dibuka / user pilih
    number: "", // nomor adjustment dari backend / generator
    memo: "",
    account: "",
    recordedQty: 0, // default aman
    difference: 0, // derived nanti
    price: 0, // default aman
  });

  const submitStockAdjustment = async () => {
    try {
      const token = await getAuthToken();

      const today = new Date().toISOString().split("T")[0];
      const monthYear = getCurrentMonthYear();

      const payload = {
        action: "stockAdjustment",
        stock_name: stockInfo.name,
        inventory_date: today,
        description: `Stock Adjustment ${monthYear}`,
        nett_purchase: adjustmentData.difference,
      };

      const response = await axios.post(
        "https://pbw-backend-api.vercel.app/api/products",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data?.message || "Stock updated successfully");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to update stock";

      toast.error(errorMessage);
    } finally {
      setIsAdjustmentOpen(false);
    }
  };

  const handleAdjustmentSubmit = () => {
    if (isEndOfMonth()) {
      submitStockAdjustment();
    } else {
      setIsConfirmOpen(true);
    }
  };

  // const stockHistory = [
  //   {
  //     date: "2025-10-10",
  //     desc: "Penerimaan Barang dari Supplier",
  //     movement: "+",
  //     quantity: 300,
  //     price: 5000,
  //     total: 1500000,
  //   },
  //   {
  //     date: "2025-10-15",
  //     desc: "Penjualan ke Customer A",
  //     movement: "-",
  //     quantity: 150,
  //     price: 5000,
  //     total: 750000,
  //   },
  //   {
  //     date: "2025-10-20",
  //     desc: "Adjustment Stock (Koreksi)",
  //     movement: "+",
  //     quantity: 50,
  //     price: 5000,
  //     total: 250000,
  //   },
  // ];

  type StockHistoryItem = {
    date: string;
    desc: string;
    movement: "+" | "-";
    quantity: number;
    price: number;
    total: number;
  };

  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([]);

  // Fetch
  useEffect(() => {
    if (!id) return;
    const fetchStockInfo = async () => {
      try {
        const token = await getAuthToken();

        const res = await axios.get(
          "https://pbw-backend-api.vercel.app/api/products",
          {
            params: {
              action: "getStocks",
              search: id, // product_id
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data.formattedData?.[0];
        if (!data) return;

        setStockInfo({
          name: data.name,
          sku: data.sku,
          category: data.category,
          unit: data.unit,
          cogs: 0, // sementara
          totalQuantity: data.current_stock,
          minimumStock: data.minimum_stock,
          warehouse: data.warehouses?.join(", ") ?? "-",
          accountName: data.stock_COA,
          description: data.description,
          copyToProduct: data.copyToProduct,
        });
      } catch (error) {
        console.error("Failed to fetch stock info:", error);
      }
    };

    fetchStockInfo();
  }, [id]);

  useEffect(() => {
    const fetchStockHistory = async () => {
      try {
        const token = await getAuthToken();

        const res = await axios.get(
          "https://pbw-backend-api.vercel.app/api/products?action=getStockMovement",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const mappedHistory: StockHistoryItem[] = res.data.data.map(
          (item: any) => ({
            date: item.inventory_date,
            desc: item.description,
            movement: item.type === "Sales" ? "-" : "+",
            quantity: item.nett_quantity,
            price: item.nett_price_item,
            total: item.nett_purchase,
          })
        );

        // sort by date DESC (latest first)
        mappedHistory.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setStockHistory(mappedHistory);
      } catch (error) {
        console.error("Failed to fetch stock movement:", error);
      }
    };

    fetchStockHistory();
  }, []);

  // Handle perubahan input data
  const handleChange = (field: string, value: string | number) => {
    setStockInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdjustmentChange = (field: string, value: string | number) => {
    setAdjustmentData((prev) => ({ ...prev, [field]: value }));
  };

  // const handleSaveChanges = () => {
  //   console.log("Saving changes:", stockInfo);
  // };

  const handleSaveChanges = async () => {
    try {
      const token = await getAuthToken();

      const payload = {
        action: "editStock",
        id,
        category: stockInfo.category,
        minimum_stock: stockInfo.minimumStock,
        warehouses: stockInfo.warehouse ? [stockInfo.warehouse] : [],
        description: stockInfo.description,
        copyToProduct: stockInfo.copyToProduct,
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

      console.log("Stock updated:", response.data);

      toast.success(response.data?.message || "Stock updated successfully");
    } catch (error: any) {
      console.error("Failed to update stock:", error);

      const errorMessage =
        error?.response?.data?.message || "Failed to update stock";

      toast.error(errorMessage);
    } finally {
      navigate("/inventory/stock");
    }
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
                  {(stockInfo.totalQuantity ?? 0).toLocaleString()}{" "}
                  {stockInfo.unit}
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
                  Rp{" "}
                  {(stockInfo.cogs * stockInfo.totalQuantity).toLocaleString(
                    "id-ID"
                  )}
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
                <Checkbox
                  id="copyToProduct"
                  checked={stockInfo.copyToProduct}
                  onCheckedChange={(checked) =>
                    setStockInfo((prev) => ({
                      ...prev,
                      copyToProduct: Boolean(checked),
                    }))
                  }
                />
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
                        Rp {(item.price ?? 0).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        Rp {(item.total ?? 0).toLocaleString("id-ID")}
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

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Stock Adjustment Confirmation
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Today is <strong>not the end of the month</strong>.
            </p>
            <p>
              Stock adjustments are typically performed at the end of the month
              to ensure inventory accuracy and accounting consistency.
            </p>
            <p className="font-medium text-gray-800">
              Are you sure you want to proceed?
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setIsConfirmOpen(false);
                submitStockAdjustment();
              }}
            >
              Yes, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
