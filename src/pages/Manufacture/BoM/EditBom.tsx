import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner"; // atau react-hot-toast sesuai project

import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import RoutingProcessCard from "./RoutingProcessCard";
import getAuthToken from "@/utils/getToken";
import { useNavigate, useParams } from "react-router-dom";

export default function EditBom() {
  const [bomName, setBomName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [estCompletionTime, setEstCompletionTime] = useState(0);
  const [jobOrderProduct, setJobOrderProduct] = useState<"yes" | "no">("no");

  const { id } = useParams();
  const navigate = useNavigate();

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

  const handleAddProcess = () => {
    setRoutingProcesses((prev) => [
      ...prev,
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
  };

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

  const mappedProcesses = routingProcesses.map((p) => ({
    process_name: p.processName,
    job_desc: p.jobDesc,

    direct_material: p.items.map((i) => ({
      coa: i.coa,
      item_name: i.name,
      desc: i.desc,
      qty: i.qty,
      unit: i.unit,
      price: i.price,
    })),

    direct_labor: p.laborItems.map((l) => ({
      coa: l.coa,
      item_name: l.name,
      desc: l.desc,
      qty: l.qty,
      unit: l.unit,
      rate_per_month: l.rateMonth,
      workday_per_month: l.workingDay,
      workhours_per_day: l.workingHours,
      order_compl_time: l.orderCompletion,
    })),

    // 🔥 overheadItems DIPERTAHANKAN → indirect_material
    indirect_material: p.overheadItems.map((o) => ({
      coa: o.coa,
      item_name: o.name,
      desc: o.desc,
      qty: o.qty,
      unit: o.unit,
      price: o.price,
    })),

    indirect_labor: p.indirectLaborItems.map((il) => ({
      coa: il.coa,
      item_name: il.name,
      desc: il.desc,
      qty: il.qty,
      unit: il.unit,
      rate_per_month: il.rateMonth,
      workday_per_month: il.workingDay,
      workhours_per_day: il.workingHours,
      order_compl_time: il.orderCompletion,
    })),

    items_depreciation: p.deprItems.map((d) => ({
      coa: d.coa,
      item_name: d.name,
      desc: d.desc,
      qty: d.qty,
      unit: d.unit,
      price: d.price,
      acc_dep: d.accDep,
      est_useful: d.usefulLife,
      operatingday_per_month: d.operatingDay,
      operatinghours_per_day: d.operatingHours,
      salvage_value: d.salvage,
      order_compl_time: d.orderCompletion,
    })),

    utilities_cost: p.utilitiesItems.map((u) => ({
      coa: u.coa,
      item_name: u.name,
      desc: u.desc,
      qty: u.qty,
      unit: u.unit,
      price: u.price,
      operating_day: u.operatingDay,
      operatinghours_per_day: u.operatingHours,
      order_compl_time: u.orderCompletion,
    })),

    other_foc: p.ofcItems.map((f) => ({
      coa: f.ofcCoa,
      item_name: f.ofcName,
      desc: f.ofcDesc,
      qty: f.ofcQty,
      unit: f.ofcUnit,
      price: f.ofcPrice,
      operating_day: f.ofcOperatingDay,
      operatinghours_per_day: f.ofcOperatingHours,
      order_compl_time: f.ofcOrderTime,
    })),
  }));

  const handleSave = async () => {
    if (!id) {
      toast.error("Bill of Material ID not found");
      return;
    }

    try {
      const token = getAuthToken();

      const payload = {
        action: "editBillOfMaterial",
        id,
        bom_name: bomName,
        sku,
        qty_goods_est: goodsProducedQty,
        category,
        est_compl_time: estCompletionTime,
        job_order_product: jobOrderProduct === "yes",
        processes: mappedProcesses,
      };

      await axios.put(
        "https://pbw-backend-api.vercel.app/api/products",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Bill of Material Updated Successfully");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update the Bill of Material");
    } finally {
      navigate("/manufacture");
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchBom = async () => {
      try {
        const token = getAuthToken();

        const res = await axios.get(
          `https://pbw-backend-api.vercel.app/api/products`,
          {
            params: {
              action: "getBillOfMaterials",
              search: id,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const bom = res.data?.data?.[0];
        if (!bom) return;

        /* =======================
         GENERAL INFORMATION
      ======================= */
        setBomName(bom.bom_name || "");
        setSku(bom.sku || "");
        setGoodsProducedQty(bom.qty_goods_est || 0);
        setCategory(bom.category || "");
        setEstCompletionTime(bom.est_compl_time || 0);
        setJobOrderProduct(bom.job_order_product ? "yes" : "no");

        /* =======================
         ROUTING PROCESSES
      ======================= */

        const mappedProcesses = (bom.processes || []).map((p: any) => ({
          id: Date.now() + Math.random(),

          processName: p.process_name || "",
          jobDesc: p.job_desc || "",

          /* ---------- DIRECT MATERIAL ---------- */
          items: (p.direct_material || []).map((i: any) => ({
            id: Date.now() + Math.random(),
            coa: i.coa || "",
            name: i.item_name || "",
            desc: i.desc || "",
            qty: i.qty || 0,
            unit: i.unit || "",
            price: i.price || 0,
          })),

          /* ---------- DIRECT LABOR ---------- */
          laborItems: (p.direct_labor || []).map((l: any) => ({
            id: Date.now() + Math.random(),
            coa: l.coa || "",
            name: l.item_name || "",
            desc: l.desc || "",
            qty: l.qty || 0,
            unit: l.unit || "",
            rateMonth: l.rate_per_month || 0,
            workingDay: l.workday_per_month || 0,
            workingHours: l.workhours_per_day || 0,
            orderCompletion: l.order_compl_time || 0,
            rateDay: l.rate_per_day || 0,
            rateHours: l.rate_per_hours || 0,
            orderCompletionDays: 0,
            rateEstimated: l.rate_estimated || 0,
          })),

          /* ---------- INDIRECT MATERIAL (OVERHEAD) ---------- */
          overheadItems: (p.indirect_material || []).map((o: any) => ({
            id: Date.now() + Math.random(),
            coa: o.coa || "",
            name: o.item_name || "",
            desc: o.desc || "",
            qty: o.qty || 0,
            unit: o.unit || "",
            price: o.price || 0,
          })),

          /* ---------- INDIRECT LABOR ---------- */
          indirectLaborItems: (p.indirect_labor || []).map((il: any) => ({
            id: Date.now() + Math.random(),
            coa: il.coa || "",
            name: il.item_name || "",
            desc: il.desc || "",
            qty: il.qty || 0,
            unit: il.unit || "",
            rateMonth: il.rate_per_month || 0,
            workingDay: il.workday_per_month || 0,
            workingHours: il.workhours_per_day || 0,
            orderCompletion: il.order_compl_time || 0,
            rateDay: il.rate_per_day || 0,
            rateHours: il.rate_per_hours || 0,
            rateEstimated: il.rate_estimated || 0,
          })),

          /* ---------- DEPRECIATION ---------- */
          deprItems: (p.items_depreciation || []).map((d: any) => ({
            id: Date.now() + Math.random(),
            coa: d.coa || "",
            name: d.item_name || "",
            desc: d.desc || "",
            qty: d.qty || 0,
            unit: d.unit || "",
            price: d.price || 0,
            accDep: d.acc_dep || 0,
            usefulLife: d.est_useful || 0,
            operatingDay: d.operatingday_per_month || 0,
            operatingHours: d.operatinghours_per_day || 0,
            salvage: d.salvage_value || 0,
            orderCompletion: d.order_compl_time || 0,
            bookValue: d.book_value || 0,
            usefulLifeTotalHours: d.est_useful_total || 0,
            depreciationPerHour: d.dep_per_hours || 0,
            rateEstimated: d.rate_estimated || 0,
          })),

          /* ---------- UTILITIES ---------- */
          utilitiesItems: (p.utilities_cost || []).map((u: any) => ({
            id: Date.now() + Math.random(),
            coa: u.coa || "",
            name: u.item_name || "",
            desc: u.desc || "",
            qty: u.qty || 0,
            unit: u.unit || "",
            price: u.price || 0,
            operatingDay: u.operating_day || 0,
            operatingHours: u.operatinghours_per_day || 0,
            orderCompletion: u.order_compl_time || 0,
            ratePerDay: u.est_per_day || 0,
            ratePerHour: u.est_per_hours || 0,
            estimatedQty: u.est_qty || 0,
            rateEstimated: u.rate_estimated || 0,
            total: u.total || 0,
          })),

          /* ---------- OTHER FOC ---------- */
          ofcItems: (p.other_foc || []).map((f: any) => ({
            id: Date.now() + Math.random(),
            ofcCoa: f.coa || "",
            ofcName: f.item_name || "",
            ofcDesc: f.desc || "",
            ofcQty: f.qty || 0,
            ofcUnit: f.unit || "",
            ofcPrice: f.price || 0,
            ofcOperatingDay: f.operating_day || 0,
            ofcOperatingHours: f.operatinghours_per_day || 0,
            ofcOrderTime: f.order_compl_time || 0,
            ofcEstimatedQty: f.est_qty || 0,
            ofcRateEstimated: f.rate_estimated || 0,
            ofcTotal: f.total || 0,
            ofcRatePerDay: f.est_per_day || 0,
            ofcRatePerHour: f.est_per_hours || 0,
          })),

          // 🔥 INI YANG KAMU LUPA
          totalMaterial: p.total_direct_material || 0,
          totalLabor: p.total_direct_labor || 0,
          totalIndirectMaterial: p.total_indirect_material || 0,
          totalIndirectLabor: p.total_indirect_labor || 0,
          totalDepreciation: p.total_items_depreciation || 0,
          totalUtilities: p.total_utilities_cost || 0,
          totalOfc: p.total_other_foc || 0,
        }));

        setRoutingProcesses(mappedProcesses);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat Bill of Material");
      }
    };

    fetchBom();
  }, [id]);

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header
          title="Edit Bill of Material"
          description="Edit existing Bill of Material for manufacturing process"
        />

        <div className="p-6 space-y-8">
          {/* FORM INPUT UTAMA */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-700">
                General Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-1">Name</p>
                  <Input
                    value={bomName}
                    onChange={(e) => setBomName(e.target.value)}
                  />
                </div>

                <div>
                  <p className="font-medium mb-1">SKU</p>
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>

                <div>
                  <p className="font-medium mb-1">
                    Quantity of Goods Produced - Estimated
                  </p>

                  <Input
                    type="number"
                    value={goodsProducedQty}
                    onChange={(e) =>
                      setGoodsProducedQty(Number(e.target.value))
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <p className="font-medium mb-1">Category</p>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div>
                  <p className="font-medium mb-1">Estimated Completion Time</p>
                  <Input
                    type="number"
                    value={estCompletionTime}
                    onChange={(e) =>
                      setEstCompletionTime(Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <p className="font-medium mb-1">Set as Job Order Product</p>

                  <Select
                    value={jobOrderProduct}
                    onValueChange={(val: "yes" | "no") =>
                      setJobOrderProduct(val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            className="bg-sidebar-active hover:bg-green-600 text-white"
            onClick={handleAddProcess}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Process
          </Button>
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
            <Button
              className="bg-sidebar-active hover:bg-green-600 text-white px-6"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
