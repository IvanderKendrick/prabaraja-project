import { useState, useEffect } from "react";
import axios from "axios";

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Filter, Plus, Search, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// ------------------------------
// GET TOKEN FROM LOCAL STORAGE
// ------------------------------
const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No token found");

  const parsed = JSON.parse(raw);
  if (!parsed.access_token) throw new Error("Token missing");

  return parsed.access_token;
};

export const WarehouseTable = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState("");

  const [filter, setFilter] = useState({
    quantityMin: "",
    quantityMax: "",
    totalMin: "",
    totalMax: "",
  });

  // ------------------------------
  // FETCH API
  // ------------------------------
  const fetchWarehouses = async () => {
    try {
      const token = getAuthToken();

      const response = await axios.get(
        "https://pbw-backend-api.vercel.app/api/products?action=getWarehouses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apiData = response.data.formattedData ?? [];

      // -------------------------
      // MAP API → TABLE STRUCTURE
      // -------------------------
      const mapped = apiData.map((item: any) => {
        const quantity = item.total_stock ?? 0;

        // Ambil current_stock dari stock_items pertama
        const currentStock =
          item.stock_items && item.stock_items.length > 0
            ? item.stock_items[0].current_stock ?? 0
            : 0;

        const total = currentStock * quantity;

        return {
          id: item.id,
          name: item.name,
          quantity,
          total,
        };
      });

      setWarehouses(mapped);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch warehouses:", err);
      setError("Failed to load warehouse data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // ------------------------------
  // ADD WAREHOUSE (API)
  // ------------------------------
  const handleAddWarehouse = async () => {
    if (newWarehouseName.trim() === "") return;

    try {
      const token = getAuthToken();

      const response = await axios.post(
        "https://pbw-backend-api.vercel.app/api/products",
        {
          action: "addWarehouse",
          name: newWarehouseName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // OPTIONAL:
      // Jika API tidak mengembalikan warehouse baru,
      // kita tetap update UI agar langsung terlihat
      // setWarehouses((prev) => [
      //   ...prev,
      //   {
      //     id: crypto.randomUUID(), // sementara (jika API tidak return id)
      //     name: newWarehouseName,
      //     quantity: 0,
      //     total: 0,
      //   },
      // ]);

      setNewWarehouseName("");
      setIsAddOpen(false);
      toast.success("New warehouse saved successfully");
      fetchWarehouses();
    } catch (error) {
      toast.success("Failed to add warehouse:", error);
    }
  };

  // ------------------------------
  // LOADING UI
  // ------------------------------
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Warehouse Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total (Rp)</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Loading warehouses...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // ------------------------------
  // ERROR UI
  // ------------------------------
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Warehouse Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total (Rp)</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <p className="text-red-600 text-sm">{error}</p>

                  <Button variant="outline" size="sm" onClick={fetchWarehouses}>
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

  // ------------------------------
  // MAIN UI
  // ------------------------------
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      {/* ===== Header Controls ===== */}
      <div className="flex justify-between items-center">
        {/* Left: Filter + Search */}
        <div className="flex items-center gap-2">
          <Button
            className="bg-sidebar-active hover:bg-green-600 text-white"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search warehouse..."
              className="pl-9 w-64"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  console.log("Searching:", e.currentTarget.value);
                }
              }}
            />
          </div>
        </div>

        {/* Right: Add Button */}
        <Button
          className="bg-sidebar-active hover:bg-green-600 text-white"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Warehouse
        </Button>
      </div>

      {/* ===== Table Section ===== */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Warehouse Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total (Rp)</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {warehouses.map((w, index) => (
              <TableRow key={w.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{w.name}</TableCell>
                <TableCell>{w.quantity}</TableCell>
                <TableCell>Rp {w.total.toLocaleString("id-ID")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ===== Filter Dialog ===== */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Filter Warehouses</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min Quantity"
                value={filter.quantityMin}
                onChange={(e) =>
                  setFilter({ ...filter, quantityMin: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Max Quantity"
                value={filter.quantityMax}
                onChange={(e) =>
                  setFilter({ ...filter, quantityMax: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min Total (Rp)"
                value={filter.totalMin}
                onChange={(e) =>
                  setFilter({ ...filter, totalMin: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Max Total (Rp)"
                value={filter.totalMax}
                onChange={(e) =>
                  setFilter({ ...filter, totalMax: e.target.value })
                }
              />
            </div>

            <Button
              className="bg-sidebar-active hover:bg-green-600 text-white w-full"
              onClick={() => {
                console.log("Apply filter:", filter);
                setIsFilterOpen(false);
              }}
            >
              Apply Filter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Add Warehouse Dialog ===== */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Warehouse</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Warehouse Name"
              value={newWarehouseName}
              onChange={(e) => setNewWarehouseName(e.target.value)}
            />

            <Button
              className="bg-sidebar-active hover:bg-green-600 text-white w-full"
              onClick={handleAddWarehouse}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
