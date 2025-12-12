import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import RoutingProcessCard from "../BoM/RoutingProcessCard";
import EditRoutingProcessCard from "./EditRoutingProcessCard";

export default function EditProductionPlan() {
  const handleRoutingChange = (id, updatedData) => {
    setRoutingProcesses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  // const [routingProcesses, setRoutingProcesses] = useState([
  //   {
  //     id: Date.now(),
  //     processName: "",
  //     jobDesc: "",

  //     items: [],
  //     laborItems: [],
  //     indirectMaterialItems: [],
  //     indirectLaborItems: [],
  //     overheadItems: [],
  //     deprItems: [],
  //     utilitiesItems: [],
  //     ofcItems: [],

  //     totalMaterial: 0,
  //     totalLabor: 0,
  //     totalIndirectMaterial: 0,
  //     totalIndirectLabor: 0,
  //     totalDepreciation: 0,
  //     totalUtilities: 0,
  //     totalOfc: 0,
  //   },
  // ]);

  const [routingProcesses, setRoutingProcesses] = useState([
    {
      id: 1,
      processName: "Cutting",
      jobDesc: "Cutting raw steel plates into required dimensions",

      // ---------------------------------------------------------
      // DIRECT MATERIAL (valid structure)
      // ---------------------------------------------------------
      items: [
        {
          id: 101,
          coa: "501",
          name: "Steel Plate 3mm",
          desc: "Cold rolled steel plate",
          qty: 10,
          unit: "pcs",
          price: 50000,
        },
        {
          id: 102,
          coa: "502",
          name: "Cutting Oil",
          desc: "Industrial cutting lubricant",
          qty: 2,
          unit: "liter",
          price: 30000,
        },
      ],

      // ---------------------------------------------------------
      // DIRECT LABOR (valid structure)
      // ---------------------------------------------------------
      laborItems: [
        {
          id: 201,
          coa: "601",
          name: "Cutting Operator",
          desc: "Operator for steel cutting machine",
          qty: 1,
          unit: "person",
          rateMonth: 4000000,

          workingDay: 25,
          workingHours: 8,
          orderCompletion: 4, // input user (hours)

          // auto-calculated (dummy)
          rateDay: 160000,
          rateHours: 20000,
          orderCompletionDays: 0.5,
          rateEstimated: 80000,
        },
      ],

      // ---------------------------------------------------------
      // INDIRECT MATERIAL (valid structure)
      // ---------------------------------------------------------
      indirectMaterialItems: [
        {
          id: 301,
          coa: "701",
          name: "Machine Grease",
          desc: "Lubricant for maintenance",
          qty: 1,
          unit: "kg",
          price: 45000,
        },
        {
          id: 302,
          coa: "702",
          name: "Cleaning Cloth",
          desc: "Cloth for wiping machine parts",
          qty: 5,
          unit: "pcs",
          price: 5000,
        },
      ],

      // ---------------------------------------------------------
      // INDIRECT LABOR (valid structure)
      // ---------------------------------------------------------
      indirectLaborItems: [
        {
          id: 401,
          coa: "801",
          name: "Helper",
          desc: "Assists the machine operator",
          qty: 1,
          unit: "person",
          rateMonth: 2500000,

          workingDay: 25,
          workingHours: 8,
          orderCompletion: 4,

          // auto-calculated
          rateDay: 100000,
          rateHours: 12500,
          rateEstimated: 50000,
        },
      ],

      // ---------------------------------------------------------
      // DEPRECIATION (valid structure)
      // ---------------------------------------------------------
      deprItems: [
        {
          id: 501,
          coa: "901",
          name: "Cutting Machine A",
          desc: "Primary cutting equipment",
          qty: 1,
          unit: "unit",
          price: 30000000,
          accDep: 10000000,

          usefulLife: 5, // years
          operatingDay: 25,
          operatingHours: 8,
          salvage: 2000000,

          orderCompletion: 4,

          // auto-calc dummy
          bookValue: 20000000,
          usefulLifeTotalHours: 25 * 8 * 12 * 5,
          depreciationPerHour: 12000,
          rateEstimated: 48000,
        },
      ],

      // ---------------------------------------------------------
      // UTILITIES (valid structure)
      // ---------------------------------------------------------
      utilitiesItems: [
        {
          id: 601,
          coa: "1001",
          name: "Electricity",
          desc: "Power consumption for cutting machine",
          qty: 200,
          unit: "kWh",
          price: 1500,

          total: 300000, // auto-calc

          operatingDay: 25,
          operatingHours: 8,

          ratePerDay: 12000,
          ratePerHour: 1500,

          orderCompletion: 4,

          estimatedQty: 2,
          rateEstimated: 6000,
        },
      ],

      // ---------------------------------------------------------
      // OTHER FACTORY OVERHEAD COST (valid structure)
      // ---------------------------------------------------------
      ofcItems: [
        {
          id: 701,
          ofcCoa: "1101",
          ofcName: "Factory Rent Share",
          ofcDesc: "Allocated rental cost for cutting area",
          ofcQty: 1,
          ofcUnit: "portion",
          ofcPrice: 500000,

          ofcTotal: 500000,

          ofcOperatingDay: 25,
          ofcOperatingHours: 8,

          ofcRatePerDay: 20000,
          ofcRatePerHour: 2500,

          ofcOrderTime: 4,
          ofcEstimatedQty: 0.5,
          ofcRateEstimated: 10000,
        },
      ],
      // ---------------------------------------------------------
      // TOTALS
      // ---------------------------------------------------------
      totalMaterial: 10 * 50000 + 2 * 30000, // 560,000
      totalLabor: 80000,

      totalIndirectMaterial: 45000 + 25000, // 70,000
      totalIndirectLabor: 50000,
      totalDepreciation: 48000,
      totalUtilities: 6000,
      totalOfc: 10000,
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
  const [goodsProducedQty, setGoodsProducedQty] = useState(10);

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
                    placeholder="Production Code"
                  />
                </div>

                {/* JOB ORDER NUMBER (Editable) */}
                <div>
                  <p className="font-medium mb-1">Job Order Number</p>
                  <Input
                    value={jobOrderNumber}
                    onChange={(e) => setJobOrderNumber(e.target.value)}
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
                  />
                </div>

                {/* SCHEDULE FINISH */}
                <div>
                  <p className="font-medium mb-1">Schedule – Finish</p>
                  <Input
                    type="date"
                    value={scheduleFinish}
                    onChange={(e) => setScheduleFinish(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROUTING PROCESS */}
          {routingProcesses.map((proc, index) => (
            <EditRoutingProcessCard
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
