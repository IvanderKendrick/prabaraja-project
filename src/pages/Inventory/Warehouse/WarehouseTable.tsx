import { useState } from "react";
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
import { Filter, Plus, Search } from "lucide-react";

export const WarehouseTable = () => {
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: "Gudang Utama", quantity: 120, total: 45000000 },
    { id: 2, name: "Gudang Cabang", quantity: 80, total: 25000000 },
  ]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState("");

  const [filter, setFilter] = useState({
    quantityMin: "",
    quantityMax: "",
    totalMin: "",
    totalMax: "",
  });

  const handleAddWarehouse = () => {
    if (newWarehouseName.trim() === "") return;
    const newWarehouse = {
      id: warehouses.length + 1,
      name: newWarehouseName,
      quantity: 0,
      total: 0,
    };
    setWarehouses([...warehouses, newWarehouse]);
    setNewWarehouseName("");
    setIsAddOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      {/* ===== Header Controls ===== */}
      <div className="flex justify-between items-center">
        {/* Left Section: Filter + Search */}
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <Button
            className="bg-sidebar-active hover:bg-green-600 text-white"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>

          {/* Search Input */}
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

        {/* Right Section: Add Button */}
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
