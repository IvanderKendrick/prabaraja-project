import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useWarehouses, useCreateWarehouse } from "@/hooks/useWarehouses";
import { toast } from "sonner";

const warehouseLocations = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Medan",
  "Makassar",
];

const AddWarehouse = () => {
  const navigate = useNavigate();
  const { data: warehouses } = useWarehouses();
  const createWarehouseMutation = useCreateWarehouse();

  const warehouseCode = useMemo(() => {
    if (!warehouses?.length) return "WH001";
    const maxNumber = Math.max(...warehouses.map((w) => w.number));
    return `WH${(maxNumber + 1).toString().padStart(3, "0")}`;
  }, [warehouses]);

  const [name, setName] = useState("");
  const [location, setLocation] = useState(warehouseLocations[0] || "");
  const [totalStock, setTotalStock] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouses) return;

    const nextNumber =
      warehouses.length > 0
        ? Math.max(...warehouses.map((w) => w.number)) + 1
        : 1;

    try {
      await createWarehouseMutation.mutateAsync({
        number: nextNumber,
        name,
        location,
        total_stock: parseInt(totalStock),
      });

      toast.success("Warehouse added successfully!");
      navigate("/products");
    } catch (error) {
      toast.error("Failed to add warehouse");
      console.error("Error adding warehouse:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
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
            <h2 className="text-2xl font-semibold ">Add New Warehouse</h2>
            <p className="">Fill out the form to add a warehouse.</p>
          </div>
        </div>
        <div className="flex flex-col items-center py-10">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Warehouse Code
                  </label>
                  <Input value={warehouseCode} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Location
                  </label>
                  <select
                    className="w-full border rounded-md py-2 px-3 text-sm mt-1"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  >
                    {warehouseLocations
                      .filter((loc) => loc !== "All")
                      .map((loc) => (
                        <option value={loc} key={loc}>
                          {loc}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Total Stock
                  </label>
                  <Input
                    type="number"
                    value={totalStock}
                    min={0}
                    onChange={(e) => setTotalStock(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/products")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createWarehouseMutation.isPending}
                  >
                    {createWarehouseMutation.isPending
                      ? "Adding..."
                      : "Add Warehouse"}
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

export default AddWarehouse;
