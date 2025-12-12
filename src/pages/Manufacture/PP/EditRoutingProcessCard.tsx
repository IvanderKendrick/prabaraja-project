import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface DirectMaterialItem {
  id: number;
  coa: string;
  name: string;
  desc: string;
  qty: number;
  unit: string;
  price: number;
}

type LaborItem = {
  id: number;
  coa: string;
  name: string;
  desc: string;
  qty: number;
  unit: string;
  rateMonth: number; // Rate/Month Or Total

  workingDay: number;
  workingHours: number;
  orderCompletion: number; // input hours dari user

  // Dihitung otomatis:
  rateDay: number;
  rateHours: number;
  orderCompletionDays: number; // otomatis (hours / workingHours)
  rateEstimated: number;
};

export default function EditRoutingProcessCard({
  index,
  data,
  onChange,
  onDelete,
}) {
  // ===============================
  // OTHER FACTORY OVERHEAD COST (UNIQUELY NAMED)
  // ===============================
  // const [ofcItems, setOfcItems] = useState([]);
  const [ofcItems, setOfcItems] = useState(data.ofcItems || []);

  const handleAddOfcItem = () => {
    setOfcItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        ofcCoa: "",
        ofcName: "",
        ofcDesc: "",
        ofcQty: 0,
        ofcUnit: "",
        ofcPrice: 0,
        ofcTotal: 0,

        ofcOperatingDay: 0,
        ofcOperatingHours: 0,

        ofcRatePerDay: 0, // Estimated Rate Capacity / Day
        ofcRatePerHour: 0, // Estimated Capacity / Hours

        ofcOrderTime: 0, // Order Completion Time (Hours)

        ofcEstimatedQty: 0,
        ofcRateEstimated: 0,
      },
    ]);
  };

  const handleDeleteOfcItem = (id) => {
    setOfcItems((prev) => {
      const updatedList = prev.filter((i) => i.id !== id);

      // Hitung ulang total OFC
      const totalOfc = updatedList.reduce(
        (sum, it) => sum + (it.ofcRateEstimated || 0),
        0
      );

      // Kirim ke parent (Routing Process)
      onChange({
        ofcItems: updatedList,
        totalOfc,
      });

      return updatedList;
    });
  };

  const handleOfcChange = (id, field, value) => {
    setOfcItems((prev) => {
      const updatedList = prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // 1. Total
        updated.ofcTotal = updated.ofcQty * updated.ofcPrice;

        // 2. Rate/Day
        updated.ofcRatePerDay =
          updated.ofcOperatingDay > 0
            ? updated.ofcTotal / updated.ofcOperatingDay
            : 0;

        // 3. Rate/Hour
        updated.ofcRatePerHour =
          updated.ofcOperatingHours > 0
            ? updated.ofcRatePerDay / updated.ofcOperatingHours
            : 0;

        // 4. Estimated QTY
        updated.ofcEstimatedQty =
          updated.ofcOperatingDay > 0 && updated.ofcOperatingHours > 0
            ? (updated.ofcQty /
                updated.ofcOperatingDay /
                updated.ofcOperatingHours) *
              updated.ofcOrderTime
            : 0;

        // 5. Rate Estimated
        updated.ofcRateEstimated =
          updated.ofcRatePerHour * updated.ofcOrderTime;

        return updated;
      });

      // --- ⬇️ TAMBAHKAN BAGIAN INI AGAR SUMMARY UPDATE ---
      const totalOfc = updatedList.reduce(
        (sum, it) => sum + (it.ofcRateEstimated || 0),
        0
      );

      onChange({ ofcItems: updatedList, totalOfc });

      // ----------------------------------------------------

      return updatedList;
    });
  };

  // TOTAL
  const ofcTotal = ofcItems.reduce(
    (sum, i) => sum + (i.ofcRateEstimated || 0),
    0
  );

  // ===================

  // const [utilitiesItems, setUtilitiesItems] = useState([]);
  const [utilitiesItems, setUtilitiesItems] = useState(
    data.utilitiesItems || []
  );

  const handleAddUtilitiesItem = () => {
    setUtilitiesItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        coa: "",
        name: "",
        desc: "",
        qty: 0,
        unit: "",
        price: 0,
        total: 0,
        operatingDay: 0,
        operatingHours: 0,
        ratePerDay: 0,
        ratePerHour: 0,
        orderCompletion: 0,
        estimatedQty: 0,
        rateEstimated: 0,
      },
    ]);
  };

  const handleDeleteUtilitiesItem = (id) => {
    setUtilitiesItems((prev) => {
      const updatedList = prev.filter((i) => i.id !== id);

      // Hitung ulang total Utilities
      const totalUtilities = updatedList.reduce(
        (sum, it) => sum + (it.rateEstimated || 0),
        0
      );

      // Kirim perubahan ke parent (Routing Process)
      onChange({
        utilitiesItems: updatedList,
        totalUtilities,
      });

      return updatedList;
    });
  };

  const handleUtilitiesChange = (id, field, value) => {
    setUtilitiesItems((prev) => {
      // 1. Update list
      const updatedList = prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // 1. Total = QTY * Price
        updated.total = updated.qty * updated.price;

        // 2. Estimated Utility Rate/Day
        updated.ratePerDay =
          updated.operatingDay > 0 ? updated.total / updated.operatingDay : 0;

        // 3. Estimated Utility Rate/Hours
        updated.ratePerHour =
          updated.operatingHours > 0
            ? updated.ratePerDay / updated.operatingHours
            : 0;

        // 4. Estimated QTY
        updated.estimatedQty =
          updated.operatingDay > 0 && updated.operatingHours > 0
            ? (updated.qty / updated.operatingDay / updated.operatingHours) *
              updated.orderCompletion
            : 0;

        // 5. Rate Estimated
        updated.rateEstimated = updated.ratePerHour * updated.orderCompletion;

        return updated;
      });

      // 2. Hitung total utilities untuk proses ini
      const totalUtilities = updatedList.reduce(
        (sum, it) => sum + (it.rateEstimated || 0),
        0
      );

      // 3. Kirim ke parent agar summary update
      onChange({
        utilitiesItems: updatedList,
        totalUtilities,
      });

      return updatedList;
    });
  };

  const utilitiesTotal = utilitiesItems.reduce(
    (sum, i) => sum + (i.rateEstimated || 0),
    0
  );

  // const [deprItems, setDeprItems] = useState([]);
  const [deprItems, setDeprItems] = useState(data.deprItems || []);
  const [deprTotal, setDeprTotal] = useState(0);

  const handleAddDepreciationItem = () => {
    const newItem = {
      id: Date.now(),
      coa: "",
      name: "",
      desc: "",
      qty: 0,
      unit: "",
      price: 0,
      accDep: 0,

      usefulLife: 0, // year
      operatingDay: 0,
      operatingHours: 0,
      salvage: 0,

      orderCompletion: 0,

      // calculated
      bookValue: 0,
      usefulLifeTotalHours: 0,
      depreciationPerHour: 0,
      rateEstimated: 0,
    };

    setDeprItems((prev) => [...prev, newItem]);
  };

  const handleDepreciationChange = (id, field, value) => {
    setDeprItems((prev) => {
      const updatedList = prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // ---------- BOOK VALUE ----------
        updated.bookValue = updated.qty * updated.price - updated.accDep;

        // ---------- USEFUL LIFE TOTAL HOURS ----------
        if (
          updated.operatingDay > 0 &&
          updated.operatingHours > 0 &&
          updated.usefulLife > 0
        ) {
          updated.usefulLifeTotalHours =
            updated.operatingDay *
            updated.operatingHours *
            12 *
            updated.usefulLife;
        } else {
          updated.usefulLifeTotalHours = 0;
        }

        // ---------- DEPRECIATION / HOUR ----------
        if (updated.usefulLifeTotalHours > 0) {
          updated.depreciationPerHour =
            (updated.bookValue - updated.salvage) /
            updated.usefulLifeTotalHours;
        } else {
          updated.depreciationPerHour = 0;
        }

        // ---------- RATE ESTIMATED ----------
        const valid =
          updated.operatingDay > 0 &&
          updated.operatingHours > 0 &&
          updated.orderCompletion > 0;

        if (valid) {
          updated.rateEstimated =
            updated.depreciationPerHour * updated.orderCompletion;
        } else {
          updated.rateEstimated = updated.accDep;
        }

        return updated;
      });

      // ---------- TOTAL DEPRECIATION ----------
      const totalDepreciation = updatedList.reduce(
        (sum, it) => sum + (it.rateEstimated || 0),
        0
      );

      // ---------- UPDATE PARENT ROUTING PROCESS ----------
      onChange({
        deprItems: updatedList,
        totalDepreciation,
      });

      return updatedList;
    });
  };

  const handleDeleteDepreciationItem = (id) => {
    setDeprItems((prev) => {
      const updatedList = prev.filter((item) => item.id !== id);

      // Hitung ulang total depreciation
      const totalDepreciation = updatedList.reduce(
        (sum, it) => sum + (it.rateEstimated || 0),
        0
      );

      // Kirim update ke parent (Routing Process)
      onChange({
        deprItems: updatedList,
        totalDepreciation,
      });

      return updatedList;
    });
  };

  useEffect(() => {
    const total = deprItems.reduce((sum, item) => sum + item.rateEstimated, 0);
    setDeprTotal(total);
  }, [deprItems]);

  // INDIRECT LABOR COST STATES
  // const [indirectLaborItems, setIndirectLaborItems] = useState([]);
  const [indirectLaborItems, setIndirectLaborItems] = useState(
    data.indirectLaborItems || []
  );
  const [indirectLaborTotal, setIndirectLaborTotal] = useState(0);

  const handleAddIndirectLaborItem = () => {
    const newItem = {
      id: Date.now(),
      coa: "",
      name: "",
      desc: "",
      qty: 0,
      unit: "",
      rateMonth: 0,
      workingDay: 0,
      workingHours: 0,
      rateDay: 0,
      rateHours: 0,
      orderCompletion: 0,
      rateEstimated: 0,
    };

    setIndirectLaborItems((prev) => [...prev, newItem]);
  };

  const handleIndirectLaborChange = (id, field, value) => {
    setIndirectLaborItems((prev) => {
      const updatedList = prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // --- HITUNG RATE/DAY ---
        updated.rateDay =
          updated.workingDay > 0 ? updated.rateMonth / updated.workingDay : 0;

        // --- HITUNG RATE/HOURS ---
        updated.rateHours =
          updated.workingHours > 0 ? updated.rateDay / updated.workingHours : 0;

        // --- HITUNG RATE-ESTIMATED ---
        const valid =
          updated.workingDay > 0 &&
          updated.workingHours > 0 &&
          updated.orderCompletion > 0;

        updated.rateEstimated = valid
          ? updated.qty * updated.rateHours * updated.orderCompletion
          : updated.qty * updated.rateMonth;

        return updated;
      });

      // --- HITUNG TOTAL INDIRECT LABOR ---
      const totalIndirectLabor = updatedList.reduce(
        (sum, i) => sum + (i.rateEstimated || 0),
        0
      );

      // --- KIRIM KE PARENT ROUTING PROCESS ---
      onChange({
        indirectLaborItems: updatedList,
        totalIndirectLabor,
      });

      return updatedList;
    });
  };

  const handleDeleteIndirectLaborItem = (id) => {
    setIndirectLaborItems((prev) => {
      const updatedList = prev.filter((item) => item.id !== id);

      // Hitung ulang total indirect labor
      const totalIndirectLabor = updatedList.reduce(
        (sum, it) => sum + (it.rateEstimated || 0),
        0
      );

      // Kirim update ke parent (Routing Process)
      onChange({
        indirectLaborItems: updatedList,
        totalIndirectLabor,
      });

      return updatedList;
    });
  };

  useEffect(() => {
    const total = indirectLaborItems.reduce(
      (sum, item) => sum + item.rateEstimated,
      0
    );
    setIndirectLaborTotal(total);
  }, [indirectLaborItems]);

  // const [overheadItems, setOverheadItems] = useState([]);
  const [overheadItems, setOverheadItems] = useState(
    data.indirectMaterialItems || []
  );

  const handleAddOverheadItem = () => {
    setOverheadItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        coa: "",
        name: "",
        desc: "",
        qty: 0,
        unit: "",
        price: 0,
      },
    ]);
  };

  const handleOverheadChange = (id, field, value) => {
    setOverheadItems((prev) => {
      // Update item yang berubah
      const updatedList = prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // Hitung ulang total item
        updated.total = updated.qty * updated.price;

        return updated;
      });

      // Hitung total indirect material
      const totalIndirectMaterial = updatedList.reduce(
        (sum, it) => sum + (it.total || 0),
        0
      );

      // Kirim ke parent (routing process)
      onChange({
        overheadItems: updatedList,
        totalIndirectMaterial,
      });

      return updatedList;
    });
  };

  const handleDeleteOverheadItem = (id) => {
    setOverheadItems((prev) => {
      const updatedList = prev.filter((item) => item.id !== id);

      // Hitung ulang total Indirect Material Cost
      const totalIndirectMaterial = updatedList.reduce(
        (sum, it) => sum + (it.total || 0),
        0
      );

      // Kirim ke parent (Routing Process)
      onChange({
        overheadItems: updatedList,
        totalIndirectMaterial,
      });

      return updatedList;
    });
  };

  const overheadTotal = overheadItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  // DIRECT LABOR COST
  // const [laborItems, setLaborItems] = useState<LaborItem[]>([]);
  const [laborItems, setLaborItems] = useState<LaborItem[]>(
    data.laborItems || []
  );

  const handleAddLaborItem = () => {
    setLaborItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        coa: "",
        name: "",
        desc: "",
        qty: 0,
        unit: "",
        rateMonth: 0,
        workingDay: 0,
        workingHours: 0,
        orderCompletion: 0,

        rateDay: 0,
        rateHours: 0,
        orderCompletionDays: 0,
        rateEstimated: 0,
      },
    ]);
  };

  const handleLaborChange = (
    id: number,
    field: string,
    value: number | string
  ) => {
    setLaborItems((prev) => {
      const updatedList = prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        const { rateMonth, workingDay, workingHours, orderCompletion, qty } =
          updated;

        // --- RATE/DAY ---
        updated.rateDay = workingDay > 0 ? rateMonth / workingDay : 0;

        // --- RATE/HOURS ---
        updated.rateHours =
          workingHours > 0 ? updated.rateDay / workingHours : 0;

        // --- ORDER COMPLETION (IN DAYS) ---
        updated.orderCompletionDays =
          workingHours > 0 ? orderCompletion / workingHours : 0;

        // --- RATE ESTIMATED ---
        const valid = workingDay > 0 && workingHours > 0 && orderCompletion > 0;

        updated.rateEstimated = valid
          ? qty * updated.rateHours * orderCompletion
          : qty * rateMonth;

        return updated;
      });

      // -----------------------------
      // HITUNG TOTAL DIRECT LABOR
      // -----------------------------
      const totalLabor = updatedList.reduce(
        (sum, it) => sum + (it.rateEstimated || 0),
        0
      );

      // -----------------------------
      // KIRIM KE PARENT (ROUTING PROCESS)
      // -----------------------------
      onChange({
        laborItems: updatedList,
        totalLabor,
      });

      return updatedList;
    });
  };

  const laborTotal = laborItems.reduce(
    (sum, item) => sum + item.rateEstimated,
    0
  );

  const handleDeleteLaborItem = (id: number) => {
    setLaborItems((prev) => {
      const updatedList = prev.filter((item) => item.id !== id);

      // Hitung ulang total labor
      const totalLabor = updatedList.reduce(
        (sum, it) => sum + (it.rateEstimated || 0),
        0
      );

      // Kirim ulang ke parent (Routing Process)
      onChange({
        laborItems: updatedList,
        totalLabor,
      });

      return updatedList;
    });
  };

  // const [items, setItems] = useState<DirectMaterialItem[]>([]);
  const [items, setItems] = useState<DirectMaterialItem[]>(data.items || []);
  // const [items, setItems] = useState<DirectMaterialItem[]>([
  //   {
  //     id: 1,
  //     coa: "",
  //     name: "",
  //     desc: "",
  //     qty: 0,
  //     unit: "",
  //     price: 0,
  //   },
  // ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        coa: "",
        name: "",
        desc: "",
        qty: 0,
        unit: "",
        price: 0,
      },
    ]);
  };

  const handleItemChange = (
    id: number,
    field: keyof DirectMaterialItem,
    value: any
  ) => {
    setItems((prev) => {
      const updatedList = prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      );

      // --- HITUNG TOTAL DIRECT MATERIAL ---
      const totalMaterial = updatedList.reduce(
        (sum, it) => sum + (it.qty * it.price || 0),
        0
      );

      // --- KIRIM VALUE KE ROUTING PROCESS (PARENT) ---
      onChange({
        items: updatedList,
        totalMaterial,
      });

      return updatedList;
    });
  };

  const totalCost = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleDeleteItem = (id) => {
    setItems((prev) => {
      const updatedList = prev.filter((item) => item.id !== id);

      // Hitung total ulang per item
      const totalMaterial = updatedList.reduce(
        (sum, it) => sum + (it.qty || 0) * (it.price || 0),
        0
      );

      // Kirim ke parent
      onChange({
        items: updatedList,
        totalMaterial,
      });

      return updatedList;
    });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">Routing Process</h2>

        {/* FORM ROUTING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium mb-1">Process {index + 1} Name</p>
            <Input
              disabled
              value={data.processName}
              placeholder="Process name"
            />
          </div>

          <div>
            <p className="font-medium mb-1">Job Desc</p>
            <Input
              disabled
              value={data.jobDesc}
              placeholder="Job description"
            />
          </div>
        </div>

        {/* DIRECT MATERIAL SECTION */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              DIRECT MATERIAL
            </h2>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>COA</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Desc</TableHead>
                  <TableHead>QTY</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <Input
                        disabled
                        value={item.coa}
                        onChange={(e) =>
                          handleItemChange(item.id, "coa", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(item.id, "name", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        value={item.desc}
                        onChange={(e) =>
                          handleItemChange(item.id, "desc", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "qty",
                            Number(e.target.value)
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(item.id, "unit", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "price",
                            Number(e.target.value)
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>
                      Rp {(item.qty * item.price).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* TOTAL SECTION */}
          <div className="flex justify-end pt-4">
            <div className="text-right">
              <p className="font-semibold text-gray-700">
                Total Direct Material Cost-Estimated:
              </p>
              <p className="text-xl font-bold text-green-700">
                Rp {totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* DIRECT LABOR COST */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              DIRECT LABOR COST
            </h2>
          </div>

          <div className="space-y-6">
            {laborItems.map((item, index) => (
              <div
                key={item.id}
                className="border rounded-xl p-5 bg-white shadow-sm space-y-5"
              >
                {/* HEADER + DELETE */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Item #{index + 1}
                  </h3>
                </div>

                {/* --------------------- BARIS 1 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="text-sm font-medium">COA</label>
                    <Input
                      disabled
                      value={item.coa}
                      onChange={(e) =>
                        handleLaborChange(item.id, "coa", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Item Name</label>
                    <Input
                      disabled
                      value={item.name}
                      onChange={(e) =>
                        handleLaborChange(item.id, "name", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Desc</label>
                    <Input
                      disabled
                      value={item.desc}
                      onChange={(e) =>
                        handleLaborChange(item.id, "desc", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">QTY</label>
                    <Input
                      disabled
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleLaborChange(
                          item.id,
                          "qty",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      disabled
                      value={item.unit}
                      onChange={(e) =>
                        handleLaborChange(item.id, "unit", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Rate/Month or Total
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.rateMonth}
                      onChange={(e) =>
                        handleLaborChange(
                          item.id,
                          "rateMonth",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {/* --------------------- BARIS 2 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Working Day/Month
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.workingDay}
                      onChange={(e) =>
                        handleLaborChange(
                          item.id,
                          "workingDay",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Working Hours/Day
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.workingHours}
                      onChange={(e) =>
                        handleLaborChange(
                          item.id,
                          "workingHours",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Rate/Day</label>
                    <p className="font-semibold">
                      Rp {item.rateDay.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Rate/Hours</label>
                    <p className="font-semibold">
                      Rp {item.rateHours.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* --------------------- BARIS 3 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Order Completion Time (Hours)
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.orderCompletion}
                      onChange={(e) =>
                        handleLaborChange(
                          item.id,
                          "orderCompletion",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {/* --------------------- BARIS 4 --------------------- */}
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">Rate-Estimated</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {item.rateEstimated.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="flex justify-end pt-4">
            <div className="text-right">
              <p className="font-semibold text-gray-700">
                Total Direct Labor Cost-Estimated:
              </p>
              <p className="text-xl font-bold text-green-700">
                Rp {laborTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-gray-800">
          FACTORY OVERHEAD COST
        </h1>
        {/* FACTORY OVERHEAD COST - INDIRECT MATERIAL */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold uppercase text-gray-800">
              Indirect Material
            </h2>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>COA</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Desc</TableHead>
                  <TableHead>QTY</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {overheadItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <Input
                        disabled
                        value={item.coa}
                        onChange={(e) =>
                          handleOverheadChange(item.id, "coa", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        value={item.name}
                        onChange={(e) =>
                          handleOverheadChange(item.id, "name", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        value={item.desc}
                        onChange={(e) =>
                          handleOverheadChange(item.id, "desc", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          handleOverheadChange(
                            item.id,
                            "qty",
                            Number(e.target.value)
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        value={item.unit}
                        onChange={(e) =>
                          handleOverheadChange(item.id, "unit", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        disabled
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleOverheadChange(
                            item.id,
                            "price",
                            Number(e.target.value)
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>
                      Rp {(item.qty * item.price).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* TOTAL OVERHEAD MATERIAL COST */}
          <div className="flex justify-end pt-4">
            <div className="text-right">
              <p className="font-semibold text-gray-700">
                Total Indirect Material Cost-Estimated:
              </p>
              <p className="text-xl font-bold text-green-700">
                Rp {overheadTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* INDIRECT LABOR COST */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              INDIRECT LABOR COST
            </h2>
          </div>

          <div className="space-y-6">
            {indirectLaborItems.map((item, index) => (
              <div
                key={item.id}
                className="border rounded-xl p-5 bg-white shadow-sm space-y-5"
              >
                {/* HEADER + DELETE */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Indirect Item #{index + 1}
                  </h3>
                </div>

                {/* --------------------- BARIS 1 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="text-sm font-medium">COA</label>
                    <Input
                      disabled
                      value={item.coa}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "coa",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Item Name</label>
                    <Input
                      disabled
                      value={item.name}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Desc</label>
                    <Input
                      disabled
                      value={item.desc}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "desc",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">QTY</label>
                    <Input
                      disabled
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "qty",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      disabled
                      value={item.unit}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "unit",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Rate/Month or Total
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.rateMonth}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "rateMonth",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {/* --------------------- BARIS 2 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Working Day/Month
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.workingDay}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "workingDay",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Working Hours/Day
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.workingHours}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "workingHours",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Rate/Day</label>
                    <p className="font-semibold">
                      Rp {item.rateDay.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Rate/Hours</label>
                    <p className="font-semibold">
                      Rp {item.rateHours.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* --------------------- BARIS 3 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Order Completion Time (Hours)
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.orderCompletion}
                      onChange={(e) =>
                        handleIndirectLaborChange(
                          item.id,
                          "orderCompletion",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {/* --------------------- BARIS 4 --------------------- */}
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">Rate-Estimated</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {item.rateEstimated.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="flex justify-end pt-4">
            <div className="text-right">
              <p className="font-semibold text-gray-700">
                Total Indirect Labor Cost-Estimated:
              </p>
              <p className="text-xl font-bold text-green-700">
                Rp {indirectLaborTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* FACTORY PLANT / MACHINE / EQUIPMENT DEPRECIATION */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Factory Plant / Machine / Equipment Depreciation
            </h2>
          </div>

          <div className="space-y-6">
            {deprItems.map((item, index) => (
              <div
                key={item.id}
                className="border rounded-xl p-5 bg-white shadow-sm space-y-5"
              >
                {/* HEADER + DELETE */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Equipment #{index + 1}
                  </h3>
                </div>

                {/* --------------------- BARIS 1 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div>
                    <label className="text-sm font-medium">COA</label>
                    <Input
                      disabled
                      value={item.coa}
                      onChange={(e) =>
                        handleDepreciationChange(item.id, "coa", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Item Name</label>
                    <Input
                      disabled
                      value={item.name}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Desc</label>
                    <Input
                      disabled
                      value={item.desc}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "desc",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">QTY</label>
                    <Input
                      disabled
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "qty",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      disabled
                      value={item.unit}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "unit",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      disabled
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "price",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Acc. Dep.</label>
                    <Input
                      disabled
                      type="number"
                      value={item.accDep}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "accDep",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {/* BOOK VALUE */}
                <div className="pt-2">
                  <label className="text-sm font-medium">Book Value</label>
                  <p className="text-lg font-bold">
                    Rp {item.bookValue.toLocaleString()}
                  </p>
                </div>

                {/* --------------------- BARIS 2 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">
                      Estimated Useful Life (Year)
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.usefulLife}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "usefulLife",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Operating Day/Month
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.operatingDay}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "operatingDay",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Operating Hours/Day
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.operatingHours}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "operatingHours",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Salvage Value</label>
                    <Input
                      disabled
                      type="number"
                      value={item.salvage}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "salvage",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Total Useful Life (Hours)
                    </label>
                    <p className="font-semibold">
                      {item.usefulLifeTotalHours.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Depreciation / Hours
                    </label>
                    <p className="font-semibold">
                      Rp {item.depreciationPerHour.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* --------------------- BARIS 3 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">
                      Order Completion Time (Hours)
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.orderCompletion}
                      onChange={(e) =>
                        handleDepreciationChange(
                          item.id,
                          "orderCompletion",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {/* --------------------- BARIS 4 --------------------- */}
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">Rate-Estimated</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {item.rateEstimated.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="flex justify-end pt-4">
            <div className="text-right">
              <p className="font-semibold text-gray-700">
                Total Factory Plant/Machine/Equipment Depreciation-Estimated:
              </p>
              <p className="text-xl font-bold text-green-700">
                Rp {deprTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* UTILITIES COST */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Utilities Cost
            </h2>
          </div>

          <div className="space-y-6">
            {utilitiesItems.map((item, index) => (
              <div
                key={item.id}
                className="border rounded-xl p-5 bg-white shadow-sm space-y-5"
              >
                {/* HEADER + DELETE */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Utility #{index + 1}
                  </h3>
                </div>

                {/* --------------------- ROW 1 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div>
                    <label className="text-sm font-medium">COA</label>
                    <Input
                      disabled
                      value={item.coa}
                      onChange={(e) =>
                        handleUtilitiesChange(item.id, "coa", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Item Name</label>
                    <Input
                      disabled
                      value={item.name}
                      onChange={(e) =>
                        handleUtilitiesChange(item.id, "name", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Desc</label>
                    <Input
                      disabled
                      value={item.desc}
                      onChange={(e) =>
                        handleUtilitiesChange(item.id, "desc", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">QTY</label>
                    <Input
                      disabled
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleUtilitiesChange(
                          item.id,
                          "qty",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      disabled
                      value={item.unit}
                      onChange={(e) =>
                        handleUtilitiesChange(item.id, "unit", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      disabled
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleUtilitiesChange(
                          item.id,
                          "price",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Total</label>
                    <p className="font-semibold">
                      Rp {item.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* --------------------- ROW 2 (Utility Rate Info) --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Operating Day</label>
                    <Input
                      disabled
                      type="number"
                      value={item.operatingDay}
                      onChange={(e) =>
                        handleUtilitiesChange(
                          item.id,
                          "operatingDay",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Operating Hours/Day
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.operatingHours}
                      onChange={(e) =>
                        handleUtilitiesChange(
                          item.id,
                          "operatingHours",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Estimated Utility Rate / Day
                    </label>
                    <p className="font-semibold">
                      Rp {item.ratePerDay.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Estimated Utility Rate / Hours
                    </label>
                    <p className="font-semibold">
                      Rp {item.ratePerHour.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* --------------------- ROW 3 (Order Completion) --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">
                      Order Completion Time (Hours)
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.orderCompletion}
                      onChange={(e) =>
                        handleUtilitiesChange(
                          item.id,
                          "orderCompletion",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Estimated QTY</label>
                    <p className="font-semibold">
                      {item.estimatedQty.toLocaleString()} {item.unit}
                    </p>
                  </div>
                </div>

                {/* --------------------- RATE-ESTIMATED --------------------- */}
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">Rate-Estimated</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {item.rateEstimated.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL UTILITIES */}
          <div className="flex justify-end pt-4">
            <div className="text-right">
              <p className="font-semibold text-gray-700">
                Total Utilities Cost-Estimated:
              </p>
              <p className="text-xl font-bold text-green-700">
                Rp {utilitiesTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* OTHER FACTORY OVERHEAD COST */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Other Factory Overhead Cost
            </h2>
          </div>

          <div className="space-y-6">
            {ofcItems.map((item, index) => (
              <div
                key={item.id}
                className="border rounded-xl p-5 bg-white shadow-sm space-y-5"
              >
                {/* HEADER + DELETE */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Overhead #{index + 1}
                  </h3>
                </div>

                {/* --------------------- ROW 1 --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div>
                    <label className="text-sm font-medium">COA</label>
                    <Input
                      disabled
                      value={item.ofcCoa}
                      onChange={(e) =>
                        handleOfcChange(item.id, "ofcCoa", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Item Name</label>
                    <Input
                      disabled
                      value={item.ofcName}
                      onChange={(e) =>
                        handleOfcChange(item.id, "ofcName", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Desc</label>
                    <Input
                      disabled
                      value={item.ofcDesc}
                      onChange={(e) =>
                        handleOfcChange(item.id, "ofcDesc", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">QTY</label>
                    <Input
                      disabled
                      type="number"
                      value={item.ofcQty}
                      onChange={(e) =>
                        handleOfcChange(
                          item.id,
                          "ofcQty",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      disabled
                      value={item.ofcUnit}
                      onChange={(e) =>
                        handleOfcChange(item.id, "ofcUnit", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      disabled
                      type="number"
                      value={item.ofcPrice}
                      onChange={(e) =>
                        handleOfcChange(
                          item.id,
                          "ofcPrice",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Total</label>
                    <p className="font-semibold">
                      Rp {item.ofcTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* --------------------- ROW 2 (Operating Info) --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Operating Day</label>
                    <Input
                      disabled
                      type="number"
                      value={item.ofcOperatingDay}
                      onChange={(e) =>
                        handleOfcChange(
                          item.id,
                          "ofcOperatingDay",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Operating Hours/Day
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.ofcOperatingHours}
                      onChange={(e) =>
                        handleOfcChange(
                          item.id,
                          "ofcOperatingHours",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Estimated Rate Capacity / Day
                    </label>
                    <p className="font-semibold">
                      Rp {item.ofcRatePerDay.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Estimated Capacity / Hours
                    </label>
                    <p className="font-semibold">
                      Rp {item.ofcRatePerHour.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* --------------------- ROW 3 (Order Completion) --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">
                      Order Completion Time (Hours)
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={item.ofcOrderTime}
                      onChange={(e) =>
                        handleOfcChange(
                          item.id,
                          "ofcOrderTime",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Estimated QTY</label>
                    <p className="font-semibold">
                      {item.ofcEstimatedQty.toLocaleString()} {item.ofcUnit}
                    </p>
                  </div>
                </div>

                {/* --------------------- RATE-ESTIMATED --------------------- */}
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">Rate-Estimated</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {item.ofcRateEstimated.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL OVERHEAD COST */}
          <div className="flex justify-end pt-4">
            <div className="text-right">
              <p className="font-semibold text-gray-700">
                Total Other Factory Overhead Cost-Estimated:
              </p>
              <p className="text-xl font-bold text-green-700">
                Rp {ofcTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
