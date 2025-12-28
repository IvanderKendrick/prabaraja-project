// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import SalesItemsForm from "../../components/sales/SalesItemsForm";
// import { Sidebar } from "@/components/Sidebar";
// import { Header } from "@/components/Header";
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Textarea } from "../../components/ui/textarea";
// import { Label } from "../../components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
// import { FileText, Truck, Package, Quote } from "lucide-react";
// import { SalesTaxCalculation } from "@/components/sales/SalesTaxCalculation";

// const defaultItem = {
//   item_name: "",
//   sku: "",
//   memo: "",
//   qty: 1,
//   unit: "pcs",
//   return_qty: 0,
//   price: 0,
//   disc_item: 0,
//   disc_item_type: "percentage",
// };

// export default function EditSalesShipment() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [form, setForm] = useState<any>({
//     id: "",
//     type: "Shipment",
//     number_suffix: "",
//     date: "",
//     tracking_number: "",
//     carrier: "",
//     shipping_date: "",
//     due_date: "",
//     status: "",
//     tags: "",
//     items: [defaultItem],
//     grand_total: 0,
//     memo: "",
//     attachment_url: null,
//     customer_name: "",
//     customer_address: "",
//     customer_phone: "",
//     tax_method: "Before Calculate",
//     ppn_percentage: "11",
//     pph_type: "pph23",
//     pph_percentage: "2",
//     dpp: 0,
//     ppn: 0,
//     pph: 0,
//     total: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [taxDetails, setTaxDetails] = useState<any>({ dpp: 0, ppn: 0, pph: 0, grandTotal: 0 });

//   const handleInput = (e: any) => {
//     const { name, value, type, files } = e.target;
//     if (name === "shipping_date") {
//       const sd = new Date(value);
//       const dd = new Date(sd);
//       dd.setMonth(dd.getMonth() + 1);
//       const due = dd.toISOString().split("T")[0];
//       setForm((prev: any) => ({ ...prev, [name]: value, due_date: due }));
//       return;
//     }
//     setForm((prev: any) => ({ ...prev, [name]: type === "file" ? files[0] : value }));
//   };

//   const setItems = (items: any) => setForm((prev: any) => ({ ...prev, items }));

//   const calculateSubtotal = () => {
//     return form.items.reduce((sum: number, item: any) => {
//       const price = Number(item.price || 0) * Number(item.qty || 1);
//       let disc = 0;
//       if (item.disc_item_type === "percentage") {
//         disc = (price * Number(item.disc_item || 0)) / 100;
//       } else {
//         disc = Number(item.disc_item || 0);
//       }
//       const ret = Number(item.return_qty || 0) * Number(item.price || 0);
//       const line = price - disc - ret;
//       return sum + line;

// Temporary placeholder export to avoid import-time crash while restoring component.
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SalesItemsForm from "../../components/sales/SalesItemsForm";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";
import { FileText, Truck, Package, Quote } from "lucide-react";
import { SalesTaxCalculation } from "@/components/sales/SalesTaxCalculation";

const defaultItem = {
  item_name: "",
  sku: "",
  memo: "",
  qty: 1,
  unit: "pcs",
  return_qty: 0,
  price: 0,
  disc_item: 0,
  disc_item_type: "percentage",
};

export default function EditSalesShipment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    id: "",
    type: "Shipment",
    number_suffix: "",
    date: "",
    tracking_number: "",
    carrier: "",
    shipping_date: "",
    due_date: "",
    status: "",
    tags: "",
    items: [defaultItem],
    grand_total: 0,
    memo: "",
    attachment_url: null,
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    tax_method: "Before Calculate",
    ppn_percentage: "11",
    pph_type: "pph23",
    pph_percentage: "2",
    dpp: 0,
    ppn: 0,
    pph: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [taxDetails, setTaxDetails] = useState<any>({ dpp: 0, ppn: 0, pph: 0, grandTotal: 0 });

  const handleInput = (e: any) => {
    const { name, value, type, files } = e.target;
    if (name === "shipping_date") {
      const sd = new Date(value);
      const dd = new Date(sd);
      dd.setMonth(dd.getMonth() + 1);
      const due = dd.toISOString().split("T")[0];
      setForm((prev: any) => ({ ...prev, [name]: value, due_date: due }));
      return;
    }
    setForm((prev: any) => ({ ...prev, [name]: type === "file" ? files[0] : value }));
  };

  const setItems = (items: any) => setForm((prev: any) => ({ ...prev, items }));

  const calculateSubtotal = () => {
    return form.items.reduce((sum: number, item: any) => {
      const price = Number(item.price || 0) * Number(item.qty || 1);
      let disc = 0;
      if (item.disc_item_type === "percentage") {
        disc = (price * Number(item.disc_item || 0)) / 100;
      } else {
        disc = Number(item.disc_item || 0);
      }
      const ret = Number(item.return_qty || 0) * Number(item.price || 0);
      const line = price - disc - ret;
      return sum + line;
    }, 0);
  };

  const stripBraces = (s: any) => {
    if (s === null || s === undefined) return "";
    let str = String(s);
    // Remove surrounding quotes
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      str = str.slice(1, -1);
    }
    // Remove any number of leading/trailing curly braces and whitespace
    str = str.replace(/^\s*\{+\s*/, "").replace(/\s*\}+\s*$/, "");
    return str.trim();
  };

  const normalizeTagsField = (raw: any) => {
    try {
      if (Array.isArray(raw)) return raw.map(stripBraces).filter(Boolean).join(",");
      if (typeof raw === "string") {
        const t = raw.trim();
        // Try parse JSON array
        if (t.startsWith("[") && t.endsWith("]")) {
          try {
            const parsed = JSON.parse(t);
            if (Array.isArray(parsed)) return parsed.map(stripBraces).filter(Boolean).join(",");
          } catch (_e) {
            // fallthrough
          }
        }
        // If contains commas, split and normalize each
        if (t.includes(","))
          return t
            .split(",")
            .map((x) => stripBraces(x))
            .filter(Boolean)
            .join(",");
        // Single value possibly with braces
        return stripBraces(t);
      }
      return String(raw || "");
    } catch (_e) {
      return String(raw || "");
    }
  };

  const handleTaxChange = (data: any) => {
    setTaxDetails(data);
    setForm((p: any) => ({ ...p, dpp: data.dpp, ppn: data.ppn, pph: data.pph, total: data.grandTotal }));
  };

  const getAuthToken = () => {
    const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (!raw) throw new Error("No access token");
    return JSON.parse(raw).access_token;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`https://pbw-backend-api.vercel.app/api/sales?action=getShipment&search=${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        const item = Array.isArray(json?.data) ? json.data[0] : json?.data;
        if (!item) throw new Error("Shipment not found");
        setForm((p: any) => ({
          ...p,
          id: item.id,
          type: item.type ?? "Shipment",
          number_suffix: typeof item.number === "string" && item.number.startsWith("SH-") ? item.number.replace(/^SH-/, "") : item.number ?? "",
          date: item.date ?? "",
          tracking_number: item.tracking_number ?? "",
          carrier: item.carrier ?? "",
          shipping_date: item.shipping_date ?? "",
          due_date: item.due_date ?? "",
          status: item.status ?? "",
          tags: normalizeTagsField(item.tags ?? ""),
          items: item.items ?? [defaultItem],
          grand_total: item.grand_total ?? 0,
          memo: item.memo ?? "",
          attachment_url: item.attachment_url ?? null,
          customer_name: item.customer_name ?? "",
          customer_address: item.customer_address ?? "",
          customer_phone: item.customer_phone ?? "",
          tax_method: item.tax_method ?? "Before Calculate",
          ppn_percentage: String(item.ppn_percentage ?? "11"),
          pph_type: item.pph_type ?? "pph23",
          pph_percentage: String(item.pph_percentage ?? "2"),
          dpp: item.dpp ?? 0,
          ppn: item.ppn ?? 0,
          pph: item.pph ?? 0,
          total: item.total ?? item.grand_total ?? 0,
        }));
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to load shipment");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const subtotal = calculateSubtotal();
      const apiForm = new FormData();
      apiForm.append("action", "editNewShipment");
      apiForm.append("id", form.id || id || "");
      apiForm.append("type", "Shipment");
      apiForm.append("date", form.date || "");
      apiForm.append("tracking_number", form.tracking_number || "");
      apiForm.append("carrier", form.carrier || "");
      apiForm.append("shipping_date", form.shipping_date || "");
      apiForm.append("due_date", form.due_date || "");
      apiForm.append("status", form.status || "");
      // Normalize tags: remove any existing braces and ensure a single pair when sending
      const rawTags = form.tags;
      const tagArray = Array.isArray(rawTags)
        ? rawTags.map((t: any) => stripBraces(t)).filter(Boolean)
        : String(rawTags || "")
            .split(",")
            .map((t) => stripBraces(t))
            .filter(Boolean);
      const tagsCsv = tagArray.join(",");
      apiForm.append("tags", tagsCsv ? `{${tagsCsv}}` : "");
      apiForm.append("items", JSON.stringify(form.items || []));
      apiForm.append("grand_total", String(taxDetails.grandTotal || subtotal || 0));
      apiForm.append("memo", form.memo || "");
      if (form.attachment_url && typeof form.attachment_url !== "string") apiForm.append("attachment_url", form.attachment_url);
      apiForm.append("number", String(form.number_suffix || ""));
      apiForm.append("customer_name", form.customer_name || "");
      apiForm.append("customer_address", form.customer_address || "");
      apiForm.append("customer_phone", form.customer_phone || "");
      apiForm.append("tax_method", form.tax_method || "Before Calculate");
      apiForm.append("ppn_percentage", form.ppn_percentage || "11");
      apiForm.append("pph_type", form.pph_type || "pph23");
      apiForm.append("pph_percentage", form.pph_percentage || "2");
      apiForm.append("dpp", String(form.dpp || taxDetails.dpp || 0));
      apiForm.append("ppn", String(form.ppn || taxDetails.ppn || 0));
      apiForm.append("pph", String(form.pph || taxDetails.pph || 0));
      apiForm.append("total", String(form.total || taxDetails.grandTotal || 0));
      apiForm.append("filesToDelete", typeof form.attachment_url === "string" ? form.attachment_url : "");

      const token = getAuthToken();
      const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: apiForm,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.error) throw new Error(data?.message || "Failed to update shipment");

      toast.success("Shipment updated");
      navigate("/sales/shipments");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span className="ml-3">Loading shipment...</span>
      </div>
    );

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Edit Sales Shipment" description="Edit an existing sales shipment" />
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Shipment Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-6">
                      <Label>Type</Label>
                      <Select value={form.type} disabled>
                        <SelectTrigger className="bg-gray-300 text-black cursor-not-allowed">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-orange-500" />
                            <span>Shipment</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quotation">Quotation</SelectItem>
                          <SelectItem value="Order">Order</SelectItem>
                          <SelectItem value="Shipment">Shipment</SelectItem>
                          <SelectItem value="Invoice">Invoice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mb-6">
                      <Label>Number</Label>
                      <div className="flex items-stretch">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">SH-</span>
                        <Input name="number_suffix" value={form.number_suffix} disabled className="rounded-l-none h-10 bg-gray-300 text-black cursor-not-allowed" />
                      </div>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Input name="status" value={form.status} disabled className="bg-gray-300 text-black cursor-not-allowed" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-6">
                      <Label>Shipment Date</Label>
                      <Input type="date" name="shipping_date" value={form.shipping_date} onChange={handleInput} required />
                    </div>

                    <div className="mb-6">
                      <Label>Due Date</Label>
                      <Input type="date" name="due_date" value={form.due_date} onChange={handleInput} />
                    </div>

                    <div>
                      <Label>Tags (comma separated)</Label>
                      <Input name="tags" value={form.tags} onChange={handleInput} placeholder="tag1, tag2, tag3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Customer Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <Label>Customer Name</Label>
                    <Input name="customer_name" value={form.customer_name} onChange={handleInput} required placeholder="Enter customer name" />
                  </div>
                  <div className="space-y-4">
                    <Label>Customer Address</Label>
                    <Input name="customer_address" value={form.customer_address} onChange={handleInput} placeholder="Enter customer address" />
                  </div>
                  <div className="space-y-4">
                    <Label>Customer Phone</Label>
                    <Input name="customer_phone" value={form.customer_phone} onChange={handleInput} placeholder="Enter customer phone" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Shipment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Tracking Number</Label>
                    <Input name="tracking_number" value={form.tracking_number} onChange={handleInput} placeholder="Enter tracking number" />
                  </div>
                  <div>
                    <Label>Carrier</Label>
                    <Input name="carrier" value={form.carrier} onChange={handleInput} placeholder="Enter carrier name" />
                  </div>
                  <div>
                    <Label>Shipping Date</Label>
                    <Input type="date" name="shipping_date" value={form.shipping_date} onChange={handleInput} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesItemsForm items={form.items} setItems={setItems} showSku returnFieldName="return_qty" />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-medium">
                  <div>Subtotal (Items - Retur)</div>
                  <div>Rp {calculateSubtotal().toLocaleString()}</div>
                </div>
                <SalesTaxCalculation subtotal={calculateSubtotal()} onTaxChange={handleTaxChange} onTaxMethodChange={(method: string) => setForm((p: any) => ({ ...p, tax_method: method }))} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Additional Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label>Memo</Label>
                    <Textarea name="memo" value={form.memo} onChange={handleInput} placeholder="Enter memo here..." />
                    <Label>Attachment (optional)</Label>
                    <Input type="file" name="attachment_url" onChange={handleInput} />
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div />
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Grand Total</div>
                  <div className="text-xl font-bold">Rp {Number(taxDetails?.grandTotal || calculateSubtotal()).toLocaleString()}</div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button type="button" variant="outline" disabled={submitting} onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Updating..." : "Update Shipment"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
//     }, 0);
//   };

//   const handleTaxChange = (data: any) => {
//     setTaxDetails(data);
//     setForm((p: any) => ({ ...p, dpp: data.dpp, ppn: data.ppn, pph: data.pph, total: data.grandTotal }));
//   };

//   const getAuthToken = () => {
//     const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
//     if (!raw) throw new Error("No access token");
//     return JSON.parse(raw).access_token;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = getAuthToken();
//         const res = await fetch(`https://pbw-backend-api.vercel.app/api/sales?action=getShipment&search=${id}`, { headers: { Authorization: `Bearer ${token}` } });
//         const json = await res.json();
//         const item = Array.isArray(json?.data) ? json.data[0] : json?.data?.[0] || json?.data;
//         if (!item) throw new Error("Shipment not found");
//         setForm((p: any) => ({
//           ...p,
//           id: item.id,
//           type: item.type ?? "Shipment",
//           number_suffix: typeof item.number === "string" && item.number.startsWith("SH-") ? item.number.replace(/^SH-/, "") : item.number ?? "",
//           date: item.date ?? "",
//           tracking_number: item.tracking_number ?? "",
//           carrier: item.carrier ?? "",
//           shipping_date: item.shipping_date ?? "",
//           due_date: item.due_date ?? "",
//           status: item.status ?? "",
//           tags: Array.isArray(item.tags) ? item.tags.join(",") : item.tags ?? "",
//           items: item.items ?? [defaultItem],
//           grand_total: item.grand_total ?? 0,
//           memo: item.memo ?? "",
//           attachment_url: item.attachment_url ?? null,
//           customer_name: item.customer_name ?? "",
//           customer_address: item.customer_address ?? "",
//           customer_phone: item.customer_phone ?? "",
//           tax_method: item.tax_method ?? "Before Calculate",
//           ppn_percentage: String(item.ppn_percentage ?? "11"),
//           pph_type: item.pph_type ?? "pph23",
//           pph_percentage: String(item.pph_percentage ?? "2"),
//           dpp: item.dpp ?? 0,
//           ppn: item.ppn ?? 0,
//           pph: item.pph ?? 0,
//           total: item.total ?? item.grand_total ?? 0,
//         }));
//       } catch (err: any) {
//         console.error(err);
//         toast.error(err?.message || "Failed to load shipment");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchData();
//   }, [id]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       const subtotal = calculateSubtotal();
//       const apiForm = new FormData();
//       apiForm.append("action", "editNewShipment");
//       apiForm.append("id", form.id || id || "");
//       apiForm.append("type", "Shipment");
//       apiForm.append("date", form.date || "");
//       apiForm.append("tracking_number", form.tracking_number || "");
//       apiForm.append("carrier", form.carrier || "");
//       apiForm.append("shipping_date", form.shipping_date || "");
//       apiForm.append("due_date", form.due_date || "");
//       apiForm.append("status", form.status || "");
//       apiForm.append("tags", form.tags || "");
//       apiForm.append("items", JSON.stringify(form.items || []));
//       apiForm.append("grand_total", String(taxDetails.grandTotal || subtotal || 0));
//       apiForm.append("memo", form.memo || "");
//       if (form.attachment_url && typeof form.attachment_url !== "string") apiForm.append("attachment_url", form.attachment_url);
//       apiForm.append("number", String(form.number_suffix || ""));
//       apiForm.append("customer_name", form.customer_name || "");
//       apiForm.append("customer_address", form.customer_address || "");
//       apiForm.append("customer_phone", form.customer_phone || "");
//       apiForm.append("tax_method", form.tax_method || "Before Calculate");
//       apiForm.append("ppn_percentage", form.ppn_percentage || "11");
//       apiForm.append("pph_type", form.pph_type || "pph23");
//       apiForm.append("pph_percentage", form.pph_percentage || "2");
//       apiForm.append("dpp", String(form.dpp || taxDetails.dpp || 0));
//       apiForm.append("ppn", String(form.ppn || taxDetails.ppn || 0));
//       apiForm.append("pph", String(form.pph || taxDetails.pph || 0));
//       apiForm.append("total", String(form.total || taxDetails.grandTotal || 0));
//       apiForm.append("filesToDelete", typeof form.attachment_url === "string" ? form.attachment_url : "");

//       const token = getAuthToken();
//       const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//         body: apiForm,
//       });

//       const data = await res.json().catch(() => null);
//       if (!res.ok || data?.error) throw new Error(data?.message || "Failed to update shipment");

//       toast.success("Shipment updated");
//       navigate("/sales/shipments");
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err?.message || "Failed to update");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="flex h-screen w-full">
//       <Sidebar />
//       <div className="flex-1 overflow-auto">
//         <Header title="Edit Sales Shipment" description="Edit an existing sales shipment" />
//         <div className="p-6">
//           <div className="max-w-6xl mx-auto">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Shipment Info</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-2 gap-4">
//                   <div>
//                     <div className="mb-6">
//                       <Label>Type</Label>
//                       <Select
//                         value={form.type}
//                         onValueChange={(v: any) => {
//                           if (v === "Quotation") {
//                             navigate("/create-sales");
//                             return;
//                           }
//                           if (v === "Order") {
//                             navigate("/create-sales-order");
//                             return;
//                           }
//                           if (v === "Invoice") {
//                             navigate("/create-sales-invoice");
//                             return;
//                           }
//                           setForm((p: any) => ({ ...p, type: v }));
//                         }}
//                       >
//                         <SelectTrigger>
//                           <div className="flex items-center gap-2">
//                             {form.type === "Quotation" && <Quote className="h-4 w-4 text-cyan-500" />}
//                             {form.type === "Order" && <Package className="h-4 w-4 text-blue-500" />}
//                             {form.type === "Shipment" && <Truck className="h-4 w-4 text-orange-500" />}
//                             {form.type === "Invoice" && <FileText className="h-4 w-4 text-purple-500" />}
//                             <span className="text-black-500">{form.type}</span>
//                           </div>
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Quotation">Quotation</SelectItem>
//                           <SelectItem value="Order">Order</SelectItem>
//                           <SelectItem value="Shipment">Shipment</SelectItem>
//                           <SelectItem value="Invoice">Invoice</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="mb-6">
//                       <Label>Number</Label>
//                       <div className="flex items-stretch">
//                         <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">SH-</span>
//                         <Input name="number_suffix" value={form.number_suffix} onChange={handleInput} placeholder="Enter transaction number" required className="rounded-l-none h-10" />
//                       </div>
//                     </div>

//                     <div>
//                       <Label>Status</Label>
//                       <Input name="status" value={form.status} disabled className="bg-gray-300 text-black cursor-not-allowed" />
//                     </div>
//                   </div>
//                   <div>
//                     <div className="mb-6">
//                       <Label>Shipment Date</Label>
//                       <Input type="date" name="shipping_date" value={form.shipping_date} onChange={handleInput} required />
//                     </div>

//                     <div className="mb-6">
//                       <Label>Due Date</Label>
//                       <Input type="date" name="due_date" value={form.due_date} onChange={handleInput} />
//                     </div>

//                     <div>
//                       <Label>Tags (comma separated)</Label>
//                       <Input name="tags" value={form.tags} onChange={handleInput} placeholder="tag1, tag2, tag3" />
//                     </div>
//                   </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Customer Info</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-3 gap-4">
//                   <div className="space-y-4">
//                     <Label>Customer Name</Label>
//                     <Input name="customer_name" value={form.customer_name} onChange={handleInput} required placeholder="Enter customer name" />
//                   </div>
//                   <div className="space-y-4">
//                     <Label>Customer Address</Label>
//                     <Input name="customer_address" value={form.customer_address} onChange={handleInput} placeholder="Enter customer address" />
//                   </div>
//                   <div className="space-y-4">
//                     <Label>Customer Phone</Label>
//                     <Input name="customer_phone" value={form.customer_phone} onChange={handleInput} placeholder="Enter customer phone" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Shipment Details</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-3 gap-4">
//                   <div className="space-y-4">
//                     <Label>Tracking Number</Label>
//                     <Input name="tracking_number" value={form.tracking_number} onChange={handleInput} placeholder="Enter tracking number" />
//                   </div>
//                   <div className="space-y-4">
//                     <Label>Carrier</Label>
//                     <Input name="carrier" value={form.carrier} onChange={handleInput} placeholder="Enter carrier name" />
//                   </div>
//                   <div className="space-y-4">
//                     <Label>Shipping Date</Label>
//                     <Input type="date" name="shipping_date" value={form.shipping_date} onChange={handleInput} />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Item Details</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <SalesItemsForm items={form.items} setItems={setItems} showSku returnFieldName="return_qty" />
//                 </CardContent>
//               </Card>

//               <div className="space-y-4">
//                 <div className="flex justify-between items-center text-lg font-medium">
//                   <div>Subtotal (Items - Retur)</div>
//                   <div>Rp {calculateSubtotal().toLocaleString()}</div>
//                 </div>
//                 <SalesTaxCalculation subtotal={calculateSubtotal()} onTaxChange={handleTaxChange} onTaxMethodChange={(method: string) => setForm((p: any) => ({ ...p, tax_method: method }))} />
//               </div>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Additional Info</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-2 gap-4">
//                   <div className="space-y-4">
//                     <Label>Memo</Label>
//                     <Textarea name="memo" value={form.memo} onChange={handleInput} placeholder="Enter memo here..." />
//                     <Label>Attachment (optional)</Label>
//                     <Input type="file" name="attachment_url" onChange={handleInput} />
//                   </div>
//                   <div className="flex flex-col items-end justify-between">
//                     <div />
//                   </div>
//                 </CardContent>
//               </Card>

//               <div className="mt-4 border-t border-gray-200 pt-4 mb-8">
//                 <div className="flex justify-between items-center">
//                   <div className="text-lg font-semibold">Grand Total</div>
//                   <div className="text-xl font-bold">Rp {Number(taxDetails?.grandTotal || calculateSubtotal()).toLocaleString()}</div>
//                 </div>
//                 <div className="flex justify-end gap-2 mt-3">
//                   <Button type="button" variant="outline" disabled={submitting} onClick={() => navigate(-1)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={submitting}>
//                     {submitting ? "Updating..." : "Update Shipment"}
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Sidebar } from "@/components/Sidebar";
// import { Header } from "@/components/Header";
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Sidebar } from "@/components/Sidebar";
// import { Header } from "@/components/Header";
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import SalesItemsForm from "../../components/sales/SalesItemsForm";
// import { Sidebar } from "@/components/Sidebar";
// import { Header } from "@/components/Header";
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Textarea } from "../../components/ui/textarea";
// import { Label } from "../../components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
// import { FileText, Truck, Package, Quote } from "lucide-react";
// import { SalesTaxCalculation } from "@/components/sales/SalesTaxCalculation";

// const defaultItem = {
//   item_name: "",
//   sku: "",
//   memo: "",
//   qty: 1,
//   unit: "pcs",
//   return_qty: 0,
//   price: 0,
//   disc_item: 0,
//   disc_item_type: "percentage",
// };

// export default function EditSalesShipment() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [form, setForm] = useState<any>({
//     id: "",
//     type: "Shipment",
//     number_suffix: "",
//     date: "",
//     tracking_number: "",
//     carrier: "",
//     shipping_date: "",
//     due_date: "",
//     status: "",
//     tags: "",
//     items: [defaultItem],
//     grand_total: 0,
//     memo: "",
//     attachment_url: null,
//     customer_name: "",
//     customer_address: "",
//     customer_phone: "",
//     tax_method: "Before Calculate",
//     ppn_percentage: "11",
//     pph_type: "pph23",
//     pph_percentage: "2",
//     dpp: 0,
//     ppn: 0,
//     pph: 0,
//     total: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [taxDetails, setTaxDetails] = useState<any>({ dpp: 0, ppn: 0, pph: 0, grandTotal: 0 });

//   const handleInput = (e: any) => {
//     const { name, value, type, files } = e.target;
//     if (name === "shipping_date") {
//       const sd = new Date(value);
//       const dd = new Date(sd);
//       dd.setMonth(dd.getMonth() + 1);
//       const due = dd.toISOString().split("T")[0];
//       setForm((prev: any) => ({ ...prev, [name]: value, due_date: due }));
//       return;
//     }
//     setForm((prev: any) => ({ ...prev, [name]: type === "file" ? files[0] : value }));
//   };

//   const setItems = (items: any) => setForm((prev: any) => ({ ...prev, items }));

//   const calculateSubtotal = () => {
//     return form.items.reduce((sum: number, item: any) => {
//       const price = Number(item.price || 0) * Number(item.qty || 1);
//       let disc = 0;
//       if (item.disc_item_type === "percentage") {
//         disc = (price * Number(item.disc_item || 0)) / 100;
//       } else {
//         disc = Number(item.disc_item || 0);
//       }
//       const ret = Number(item.return_qty || 0) * Number(item.price || 0);
//       const line = price - disc - ret;
//       return sum + line;
//     }, 0);
//   };

//   const handleTaxChange = (data: any) => {
//     setTaxDetails(data);
//     setForm((p: any) => ({ ...p, dpp: data.dpp, ppn: data.ppn, pph: data.pph, total: data.grandTotal }));
//   };

//   const getAuthToken = () => {
//     const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
//     if (!raw) throw new Error("No access token");
//     return JSON.parse(raw).access_token;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = getAuthToken();
//         const res = await fetch(`https://pbw-backend-api.vercel.app/api/sales?action=getShipment&search=${id}`, { headers: { Authorization: `Bearer ${token}` } });
//         const json = await res.json();
//         const item = Array.isArray(json?.data) ? json.data[0] : json?.data?.[0] || json?.data;
//         if (!item) throw new Error("Shipment not found");
//         setForm((p: any) => ({
//           ...p,
//           id: item.id,
//           type: item.type ?? "Shipment",
//           number_suffix: typeof item.number === "string" && item.number.startsWith("SH-") ? item.number.replace(/^SH-/, "") : item.number ?? "",
//           date: item.date ?? "",
//           tracking_number: item.tracking_number ?? "",
//           carrier: item.carrier ?? "",
//           shipping_date: item.shipping_date ?? "",
//           due_date: item.due_date ?? "",
//           status: item.status ?? "",
//           tags: Array.isArray(item.tags) ? item.tags.join(",") : item.tags ?? "",
//           items: item.items ?? [defaultItem],
//           grand_total: item.grand_total ?? 0,
//           memo: item.memo ?? "",
//           attachment_url: item.attachment_url ?? null,
//           customer_name: item.customer_name ?? "",
//           customer_address: item.customer_address ?? "",
//           customer_phone: item.customer_phone ?? "",
//           tax_method: item.tax_method ?? "Before Calculate",
//           ppn_percentage: String(item.ppn_percentage ?? "11"),
//           pph_type: item.pph_type ?? "pph23",
//           pph_percentage: String(item.pph_percentage ?? "2"),
//           dpp: item.dpp ?? 0,
//           ppn: item.ppn ?? 0,
//           pph: item.pph ?? 0,
//           total: item.total ?? item.grand_total ?? 0,
//         }));
//       } catch (err: any) {
//         console.error(err);
//         toast.error(err?.message || "Failed to load shipment");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchData();
//   }, [id]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       const subtotal = calculateSubtotal();
//       const apiForm = new FormData();
//       apiForm.append("action", "editNewShipment");
//       apiForm.append("id", form.id || id || "");
//       apiForm.append("type", "Shipment");
//       apiForm.append("date", form.date || "");
//       apiForm.append("tracking_number", form.tracking_number || "");
//       apiForm.append("carrier", form.carrier || "");
//       apiForm.append("shipping_date", form.shipping_date || "");
//       apiForm.append("due_date", form.due_date || "");
//       apiForm.append("status", form.status || "");
//       apiForm.append("tags", form.tags || "");
//       apiForm.append("items", JSON.stringify(form.items || []));
//       apiForm.append("grand_total", String(taxDetails.grandTotal || subtotal || 0));
//       apiForm.append("memo", form.memo || "");
//       if (form.attachment_url && typeof form.attachment_url !== "string") apiForm.append("attachment_url", form.attachment_url);
//       apiForm.append("number", String(form.number_suffix || ""));
//       apiForm.append("customer_name", form.customer_name || "");
//       apiForm.append("customer_address", form.customer_address || "");
//       apiForm.append("customer_phone", form.customer_phone || "");
//       apiForm.append("tax_method", form.tax_method || "Before Calculate");
//       apiForm.append("ppn_percentage", form.ppn_percentage || "11");
//       apiForm.append("pph_type", form.pph_type || "pph23");
//       apiForm.append("pph_percentage", form.pph_percentage || "2");
//       apiForm.append("dpp", String(form.dpp || taxDetails.dpp || 0));
//       apiForm.append("ppn", String(form.ppn || taxDetails.ppn || 0));
//       apiForm.append("pph", String(form.pph || taxDetails.pph || 0));
//       apiForm.append("total", String(form.total || taxDetails.grandTotal || 0));
//       apiForm.append("filesToDelete", typeof form.attachment_url === "string" ? form.attachment_url : "");

//       const token = getAuthToken();
//       const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//         body: apiForm,
//       });

//       const data = await res.json().catch(() => null);
//       if (!res.ok || data?.error) throw new Error(data?.message || "Failed to update shipment");

//       toast.success("Shipment updated");
//       navigate("/sales/shipments");
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err?.message || "Failed to update");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="flex h-screen w-full">
//       <Sidebar />
//       <div className="flex-1 overflow-auto">
//         <Header title="Edit Sales Shipment" description="Edit an existing sales shipment" />
//         <div className="p-6">
//           <div className="max-w-6xl mx-auto">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Shipment Info</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-2 gap-4">
//                   <div>
//                     <div className="mb-6">
//                       <Label>Type</Label>
//                       <Select
//                         value={form.type}
//                         onValueChange={(v: any) => {
//                           if (v === "Quotation") {
//                             navigate("/create-sales");
//                             return;
//                           }
//                           if (v === "Order") {
//                             navigate("/create-sales-order");
//                             return;
//                           }
//                           if (v === "Invoice") {
//                             navigate("/create-sales-invoice");
//                             return;
//                           }
//                           setForm((p: any) => ({ ...p, type: v }));
//                         }}
//                       >
//                         <SelectTrigger>
//                           <div className="flex items-center gap-2">
//                             {form.type === "Quotation" && <Quote className="h-4 w-4 text-cyan-500" />}
//                             {form.type === "Order" && <Package className="h-4 w-4 text-blue-500" />}
//                             {form.type === "Shipment" && <Truck className="h-4 w-4 text-orange-500" />}
//                             {form.type === "Invoice" && <FileText className="h-4 w-4 text-purple-500" />}
//                             <span className="text-black-500">{form.type}</span>
//                           </div>
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Quotation">Quotation</SelectItem>
//                           <SelectItem value="Order">Order</SelectItem>
//                           <SelectItem value="Shipment">Shipment</SelectItem>
//                           <SelectItem value="Invoice">Invoice</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="mb-6">
//                       <Label>Number</Label>
//                       <div className="flex items-stretch">
//                         <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">SH-</span>
//                         <Input name="number_suffix" value={form.number_suffix} onChange={handleInput} placeholder="Enter transaction number" required className="rounded-l-none h-10" />
//                       </div>
//                     </div>

//                     <div>
//                       <Label>Status</Label>
//                       <Input name="status" value={form.status} disabled className="bg-gray-300 text-black cursor-not-allowed" />
//                     </div>
//                   </div>
//                   <div>
//                     <div className="mb-6">
//                       <Label>Shipment Date</Label>
//                       <Input type="date" name="shipping_date" value={form.shipping_date} onChange={handleInput} required />
//                     </div>

//                     <div className="mb-6">
//                       <Label>Due Date</Label>
//                       <Input type="date" name="due_date" value={form.due_date} onChange={handleInput} />
//                     </div>

//                     <div>
//                       <Label>Tags (comma separated)</Label>
//                       <Input name="tags" value={form.tags} onChange={handleInput} placeholder="tag1, tag2, tag3" />
//                     </div>
//                   </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Customer Info</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-3 gap-4">
//                   <div className="space-y-4">
//                     <Label>Customer Name</Label>
//                     <Input name="customer_name" value={form.customer_name} onChange={handleInput} required placeholder="Enter customer name" />
//                   </div>
//                   <div className="space-y-4">
//                     <Label>Customer Address</Label>
//                     <Input name="customer_address" value={form.customer_address} onChange={handleInput} placeholder="Enter customer address" />
//                   </div>
//                   <div className="space-y-4">
//                     <Label>Customer Phone</Label>
//                     <Input name="customer_phone" value={form.customer_phone} onChange={handleInput} placeholder="Enter customer phone" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Shipment Details</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-3 gap-4">
//                   <div className="space-y-4">
//                     <Label>Tracking Number</Label>
//                     <Input name="tracking_number" value={form.tracking_number} onChange={handleInput} placeholder="Enter tracking number" />
//                   </div>
//                   <div className="space-y-4">
//                     <Label>Carrier</Label>
//                     <Input name="carrier" value={form.carrier} onChange={handleInput} placeholder="Enter carrier name" />
//                   </div>
//                   <div className="space-y-4">
//                     <Label>Shipping Date</Label>
//                     <Input type="date" name="shipping_date" value={form.shipping_date} onChange={handleInput} />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Item Details</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <SalesItemsForm items={form.items} setItems={setItems} showSku returnFieldName="return_qty" />
//                 </CardContent>
//               </Card>

//               <div className="space-y-4">
//                 <div className="flex justify-between items-center text-lg font-medium">
//                   <div>Subtotal (Items - Retur)</div>
//                   <div>Rp {calculateSubtotal().toLocaleString()}</div>
//                 </div>
//                 <SalesTaxCalculation subtotal={calculateSubtotal()} onTaxChange={handleTaxChange} onTaxMethodChange={(method: string) => setForm((p: any) => ({ ...p, tax_method: method }))} />
//               </div>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Additional Info</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-2 gap-4">
//                   <div className="space-y-4">
//                     <Label>Memo</Label>
//                     <Textarea name="memo" value={form.memo} onChange={handleInput} placeholder="Enter memo here..." />
//                     <Label>Attachment (optional)</Label>
//                     <Input type="file" name="attachment_url" onChange={handleInput} />
//                   </div>
//                   <div className="flex flex-col items-end justify-between">
//                     <div />
//                   </div>
//                 </CardContent>
//               </Card>

//               <div className="mt-4 border-t border-gray-200 pt-4 mb-8">
//                 <div className="flex justify-between items-center">
//                   <div className="text-lg font-semibold">Grand Total</div>
//                   <div className="text-xl font-bold">Rp {Number(taxDetails?.grandTotal || calculateSubtotal()).toLocaleString()}</div>
//                 </div>
//                 <div className="flex justify-end gap-2 mt-3">
//                   <Button type="button" variant="outline" disabled={submitting} onClick={() => navigate(-1)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={submitting}>
//                     {submitting ? "Updating..." : "Update Shipment"}
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
//                             }
//                             if (v === "Invoice") {
//                               navigate("/create-sales-invoice");
//                               return;
//                             }
//                             setForm((p: any) => ({ ...p, type: v }));
//                           }}
//                         >
//                           <SelectTrigger>
//                             <div className="flex items-center gap-2">
//                               {form.type === "Quotation" && <Quote className="h-4 w-4 text-cyan-500" />}
//                               {form.type === "Order" && <Package className="h-4 w-4 text-blue-500" />}
//                               {form.type === "Shipment" && <Truck className="h-4 w-4 text-orange-500" />}
//                               {form.type === "Invoice" && <FileText className="h-4 w-4 text-purple-500" />}
//                               <span className="text-black-500">{form.type}</span>
//                             </div>
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Quotation">Quotation</SelectItem>
//                             <SelectItem value="Order">Order</SelectItem>
//                             <SelectItem value="Shipment">Shipment</SelectItem>
//                             <SelectItem value="Invoice">Invoice</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="mb-6">
//                         <Label>Number</Label>
//                         <div className="flex items-stretch">
//                           <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">SH-</span>
//                           <Input name="number_suffix" value={form.number_suffix} onChange={handleInput} placeholder="Enter transaction number" required className="rounded-l-none h-10" />
//                         </div>
//                       </div>

//                       <div>
//                         <Label>Status</Label>
//                         <Input name="status" value={form.status} disabled className="bg-gray-300 text-black cursor-not-allowed" />
//                       </div>
//                     </div>
//                     <div>
//                       <div className="mb-6">
//                         <Label>Shipment Date</Label>
//                         <Input type="date" name="shipping_date" value={form.shipping_date} onChange={handleInput} required />
//                       </div>
//                       <div className="mb-6">
//                         <Label>Due Date</Label>
//                         <Input type="date" name="due_date" value={form.due_date} onChange={handleInput} />
//                       </div>
//                       <div>
//                         <Label>Tags (comma separated)</Label>
//                         <Input name="tags" value={form.tags} onChange={handleInput} placeholder="tag1, tag2, tag3" />
//                       </div>
//                     </div>
//                   </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Items</CardTitle>
//                 </CardHeader>
//                 <CardContent>

//                   {/* Removed duplicate CardContent block */}

//                   <SalesItemsForm items={form.items} setItems={setItems} showSku returnFieldName="return_qty" />
//                 </CardContent>
//               </Card>

//               <div className="space-y-4">
//                 <div className="flex justify-between items-center text-lg font-medium">
//                   <div>Subtotal (Items - Retur)</div>
//                   <div>Rp {form.items.reduce((s: number, it: any) => s + Number(it.price || 0) * Number(it.qty || 1), 0).toLocaleString()}</div>
//                 </div>
//                 <SalesTaxCalculation
//                   subtotal={form.items.reduce((s: number, it: any) => s + Number(it.price || 0) * Number(it.qty || 1), 0)}
//                   onTaxChange={handleTaxChange}
//                   onTaxMethodChange={(method: string) => setForm((p: any) => ({ ...p, tax_method: method }))}
//                 />
//               </div>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium">Additional Info</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-2 gap-4">
//                   <div className="space-y-4">
//                     <Label>Memo</Label>
//                     <Textarea name="memo" value={form.memo} onChange={handleInput} />
//                     <Label>Attachment (optional)</Label>
//                     <Input type="file" name="attachment_url" onChange={handleInput} />
//                   </div>
//                   <div className="flex flex-col items-end justify-between">
//                     <div />
//                   </div>
//                 </CardContent>
//               </Card>

//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={submitting}>
//                   {submitting ? "Updating..." : "Update Shipment"}
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
