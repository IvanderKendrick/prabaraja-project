import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import RoutingProcessCard from "../BoM/RoutingProcessCard";

export default function EditWorkInProcess() {
  const handleRoutingChange = (id, updatedData) => {
    setRoutingProcesses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const [routingProcesses, setRoutingProcesses] = useState([
    {
      id: Date.now(),
      processName: "",
      jobDesc: "",

      items: [],
      laborItems: [],
      indirectMaterialItems: [],
      indirectLaborItems: [],
      overheadItems: [],
      deprItems: [],
      utilitiesItems: [],
      ofcItems: [],

      totalMaterial: 0,
      totalLabor: 0,
      totalIndirectMaterial: 0,
      totalIndirectLabor: 0,
      totalDepreciation: 0,
      totalUtilities: 0,
      totalOfc: 0,
    },
  ]);

  const handleDeleteProcess = (id) => {
    setRoutingProcesses((prev) => prev.filter((p) => p.id !== id));
  };

  // useEffect(() => {
  //   const total = deprItems.reduce((sum, item) => sum + item.rateEstimated, 0);
  //   setDeprTotal(total);
  // }, [deprItems]);

  // useEffect(() => {
  //   const total = indirectLaborItems.reduce(
  //     (sum, item) => sum + item.rateEstimated,
  //     0
  //   );
  //   setIndirectLaborTotal(total);
  // }, [indirectLaborItems]);

  // STATE INPUT
  const [goodsProducedQty, setGoodsProducedQty] = useState(0);

  // HITUNGAN GENERAL START
  const totalFactoryOH = routingProcesses.reduce((sum, p) => {
    return (
      sum +
      (p.totalIndirectMaterial || 0) +
      (p.totalIndirectLabor || 0) +
      (p.totalDepreciation || 0) +
      (p.totalUtilities || 0) +
      (p.totalOfc || 0)
    );
  }, 0);

  const totalDirectCost = routingProcesses.reduce((sum, p) => {
    return sum + (p.totalMaterial || 0) + (p.totalLabor || 0);
  }, 0);

  const totalCOGM = totalFactoryOH + totalDirectCost;

  const cogmPerUnit = goodsProducedQty > 0 ? totalCOGM / goodsProducedQty : 0;
  // HITUNGAN GENERAL END

  const [productionCode, setProductionCode] = useState("");
  const [jobOrderNumber, setJobOrderNumber] = useState("");
  const [totalProductionOrder, setTotalProductionOrder] = useState(0);
  const [warehouse, setWarehouse] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleFinish, setScheduleFinish] = useState("");

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header
          title="Edit Production Plan"
          description="Edit an existing Production Plan for manufacturing process"
        />

        <div className="p-6 space-y-8">
          {/* FORM INPUT UTAMA */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-700">
                General Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAME (Disabled) */}
                <div>
                  <p className="font-medium mb-1">Name</p>
                  <Input placeholder="Name" disabled />
                </div>

                {/* PRODUCTION CODE (Editable) */}
                <div>
                  <p className="font-medium mb-1">Production Code</p>
                  <Input
                    value={productionCode}
                    onChange={(e) => setProductionCode(e.target.value)}
                    disabled
                    placeholder="Production Code"
                  />
                </div>

                {/* JOB ORDER NUMBER (Editable) */}
                <div>
                  <p className="font-medium mb-1">Job Order Number</p>
                  <Input
                    value={jobOrderNumber}
                    onChange={(e) => setJobOrderNumber(e.target.value)}
                    disabled
                    placeholder="Job Order Number"
                  />
                </div>

                {/* SKU (Disabled) */}
                <div>
                  <p className="font-medium mb-1">SKU</p>
                  <Input placeholder="SKU" disabled />
                </div>

                {/* TOTAL PRODUCTION ORDER (Editable) */}
                <div>
                  <p className="font-medium mb-1">Total Production Order</p>
                  <Input
                    type="number"
                    value={totalProductionOrder}
                    onChange={(e) =>
                      setTotalProductionOrder(Number(e.target.value))
                    }
                    disabled
                    placeholder="0"
                  />
                </div>

                {/* QTY GOODS PRODUCED - ESTIMATED (Disabled) */}
                <div>
                  <p className="font-medium mb-1">
                    Quantity of Goods Produced - Estimated
                  </p>
                  <Input
                    type="number"
                    value={goodsProducedQty}
                    disabled
                    placeholder="0"
                  />
                </div>

                {/* TOTAL QTY GOODS PRODUCED - ESTIMATED (RUMUS, Disabled) */}
                <div>
                  <p className="font-medium mb-1">
                    Total Quantity of Goods Produced - Estimated
                  </p>

                  <Input
                    type="number"
                    value={totalProductionOrder * goodsProducedQty || 0}
                    disabled
                  />
                </div>

                {/* CATEGORY (Disabled) */}
                <div>
                  <p className="font-medium mb-1">Category</p>
                  <Input placeholder="Category" disabled />
                </div>

                {/* WAREHOUSE (Editable) */}
                <div>
                  <p className="font-medium mb-1">Warehouse</p>
                  <Input
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    disabled
                    placeholder="Warehouse"
                  />
                </div>

                {/* SCHEDULE START */}
                <div>
                  <p className="font-medium mb-1">Schedule – Start</p>
                  <Input
                    type="date"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    disabled
                  />
                </div>

                {/* SCHEDULE FINISH */}
                <div>
                  <p className="font-medium mb-1">Schedule – Finish</p>
                  <Input
                    type="date"
                    value={scheduleFinish}
                    onChange={(e) => setScheduleFinish(e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROUTING PROCESS */}
          {routingProcesses.map((proc, index) => (
            <RoutingProcessCard
              key={proc.id}
              index={index}
              data={proc}
              onChange={(updated) => handleRoutingChange(proc.id, updated)}
              onDelete={() => handleDeleteProcess(proc.id)}
            />
          ))}

          <div className="border rounded-xl p-6 bg-white mt-10 space-y-4">
            <h2 className="text-xl font-semibold">Summary</h2>

            <div className="flex justify-between">
              <span className="font-medium">
                TOTAL FACTORY OVERHEAD COST - ESTIMATED
              </span>
              <span className="font-bold text-green-700">
                Rp {totalFactoryOH.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">
                TOTAL COST OF GOODS MANUFACTURED - ESTIMATED
              </span>
              <span className="font-bold text-green-700">
                Rp {totalCOGM.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">COGM / Unit - ESTIMATED</span>
              <span className="font-bold text-green-700">
                Rp {cogmPerUnit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end">
            <Button className="bg-sidebar-active hover:bg-green-600 text-white px-6">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
