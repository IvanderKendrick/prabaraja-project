import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SalesItemsForm from "../../components/sales/SalesItemsForm";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { FileText, Truck, Package, Quote } from "lucide-react";
import { SalesTaxCalculation } from "@/components/sales/SalesTaxCalculation";
import { CoaSelect } from "@/components/CoaSelect";

const defaultItem = {
  item_name: "",
  memo: "",
  qty: 1,
  unit: "pcs",
  price: 0,
  return_qty: 0,
  disc_item: 0,
  disc_item_type: "percentage",
};

export default function CreateSalesInvoice() {
  const invoiceDateDefault = new Date();
  const invoiceDateString = invoiceDateDefault.toISOString().split("T")[0];
  const dueDateDefault = (() => {
    const d = new Date(invoiceDateDefault);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  })();

  const [form, setForm] = useState<any>({
    type: "Invoice",
    number_suffix: "",
    status: "Pending",
    invoice_date: invoiceDateString,
    due_date: dueDateDefault,
    tags: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    items: [defaultItem],
    memo: "",
    attachment_url: null,
    tax_details: {},
    approver: "",
    terms: "",
    freight_out: 0,
    insurance: 0,
    customer_COA: "",
    customer_COA_id: null,
    tax_method: "",
    ppn_percentage: 0,
    pph_type: "",
    pph_percentage: 0,
    dpp: 0,
    ppn: 0,
    pph: 0,
    total: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxDetails, setTaxDetails] = useState<any>({ dpp: 0, ppn: 0, pph: 0, grandTotal: 0 });

  const navigate = useNavigate();

  const handleInput = (e: any) => {
    const { name, value, type, files } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: type === "file" ? files[0] : value }));
  };

  const setItems = (items: any) => setForm((prev: any) => ({ ...prev, items }));

  const calculateTotal = () => {
    return form.items.reduce((sum: number, item: any) => {
      const price = Number(item.price || 0) * Number(item.qty || 1);
      let disc = 0;
      if (item.disc_item_type === "percentage") {
        disc = (price * Number(item.disc_item || 0)) / 100;
      } else {
        disc = Number(item.disc_item || 0);
      }
      const ret = Number(item.return_qty || 0) * Number(item.price || 0);
      return sum + (price - disc - ret);
    }, 0);
  };

  const handleTaxChange = (data: any) => {
    setTaxDetails(data);
    setForm((p: any) => ({ ...p, tax_details: data, dpp: data.dpp, ppn: data.ppn, pph: data.pph, ppn_percentage: data.ppn_percentage, pph_type: data.pph_type, pph_percentage: data.pph_percentage, total: data.grandTotal }));
  };

  const handleTaxMethodChange = (method: string) => {
    setForm((p: any) => ({ ...p, tax_method: method }));
  };

  const getAuthToken = () => {
    const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (!authDataRaw) throw new Error("No access token found in localStorage");
    const authData = JSON.parse(authDataRaw);
    const token = authData.access_token;
    if (!token) throw new Error("Access token missing in parsed auth data");
    return token;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const subtotal = calculateTotal();
      const additional = (Number(form.freight_out) || 0) + (Number(form.insurance) || 0);
      const subtotalWithAdditional = subtotal + additional;

      // derive tax fields (prefer values from taxDetails emitted by SalesTaxCalculation)
      const ppnPercentage = Number(taxDetails.ppn_percentage || form.ppn_percentage) || 11;
      const pphType = (taxDetails.pph_type || form.pph_type || "pph23") as string;
      const pphPercentageFromDetails = Number(taxDetails.pph_percentage || form.pph_percentage || 0);

      // determine DPP based on tax method
      const isTaxAfter = (form.tax_method || "") === "After Calculate";
      let dppComputed = 0;
      if (!isTaxAfter) {
        if (ppnPercentage === 11) dppComputed = subtotalWithAdditional;
        else dppComputed = (11 / 12) * subtotalWithAdditional;
      } else {
        if (ppnPercentage === 11) dppComputed = subtotalWithAdditional / 1.11;
        else dppComputed = subtotalWithAdditional / 1.12;
      }

      const ppnComputed = Math.round(dppComputed * (ppnPercentage / 100));

      // PPh calculation: mirror SalesTaxCalculation logic but ensure PPh23 uses 2%
      let pphComputed = 0;
      if (pphType === "pph23") {
        if (!isTaxAfter) {
          pphComputed = Math.round(((subtotalWithAdditional + ppnComputed) / 1.11) * 0.02);
        } else {
          pphComputed = Math.round(((subtotalWithAdditional + ppnComputed) / 1.011) * 0.02);
        }
      } else if (pphType === "pph22") {
        if (dppComputed <= 500000000) pphComputed = Math.round(dppComputed * 0.01);
        else if (dppComputed <= 10000000000) pphComputed = Math.round(dppComputed * 0.015);
        else pphComputed = Math.round(dppComputed * 0.025);
      } else {
        // custom
        const parsed = parseFloat(String(pphPercentageFromDetails).replace(",", ".")) || 0;
        pphComputed = Math.round(dppComputed * (parsed / 100));
      }

      const grandTotalComputed = isTaxAfter ? Math.round(dppComputed) + Math.round(ppnComputed) - Math.round(pphComputed) : Math.round(subtotalWithAdditional) + Math.round(ppnComputed) - Math.round(pphComputed);

      const formData = new FormData();
      formData.append("action", "addNewInvoice");
      formData.append("type", "Invoice");
      formData.append("invoice_date", form.invoice_date || "");
      formData.append("approver", form.approver || "");
      formData.append("due_date", form.due_date || "");
      formData.append("status", form.status || "");
      // Normalize tags to Postgres array literal format: {tag1,tag2}
      const tagsArray =
        typeof form.tags === "string"
          ? form.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter((t: string) => t)
          : Array.isArray(form.tags)
          ? form.tags
          : [];
      const tagsValue = tagsArray.join(",");
      formData.append("tags", `{${tagsValue}}`);
      formData.append("items", JSON.stringify(form.items || []));
      formData.append("tax_method", form.tax_method || "");
      formData.append("ppn_percentage", String(form.ppn_percentage || taxDetails.ppn_percentage || 0));
      formData.append("pph_type", String(form.pph_type || taxDetails.pph_type || ""));
      formData.append("pph_percentage", String(form.pph_percentage || taxDetails.pph_percentage || 0));
      formData.append("grand_total", String(taxDetails.grandTotal || grandTotalComputed || subtotalWithAdditional || 0));
      formData.append("memo", form.memo || "");
      if (form.attachment_url) formData.append("attachment_url", form.attachment_url);
      // Send only the numeric suffix as `number` (exclude the INV- prefix)
      formData.append("number", form.number_suffix || "");
      formData.append("customer_name", form.customer_name || "");
      formData.append("customer_address", form.customer_address || "");
      formData.append("customer_phone", form.customer_phone || "");
      formData.append("terms", form.terms || "");
      formData.append("freight_out", String(form.freight_out || 0));
      formData.append("insurance", String(form.insurance || 0));
      formData.append("customer_COA", form.customer_COA || "");
      formData.append("dpp", String(form.dpp || taxDetails.dpp || Math.round(dppComputed) || 0));
      formData.append("ppn", String(form.ppn || taxDetails.ppn || Math.round(ppnComputed) || 0));
      formData.append("pph", String(form.pph || taxDetails.pph || Math.round(pphComputed) || 0));
      // total = Subtotal + Additional
      formData.append("total", String(form.total || taxDetails.grandTotal || Math.round(subtotalWithAdditional) || 0));

      const token = getAuthToken();
      const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.error) {
        const msg = data?.message || "Failed to create invoice";
        toast.error(msg);
        return;
      }

      toast.success("Invoice created successfully");
      navigate("/sales/invoices");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Create New Sales Invoice" description="Create a sales invoice" />
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Invoice Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-6">
                      <Label>Type</Label>
                      <Select
                        value={form.type}
                        onValueChange={(v: any) => {
                          if (v === "Quotation") {
                            navigate("/create-sales");
                            return;
                          }
                          if (v === "Order") {
                            navigate("/create-sales-order");
                            return;
                          }
                          if (v === "Shipment") {
                            navigate("/create-sales-shipment");
                            return;
                          }
                          setForm((p: any) => ({ ...p, type: v }));
                        }}
                      >
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            {form.type === "Quotation" && <Quote className="h-4 w-4 text-cyan-500" />}
                            {form.type === "Order" && <Package className="h-4 w-4 text-blue-500" />}
                            {form.type === "Shipment" && <Truck className="h-4 w-4 text-orange-500" />}
                            {form.type === "Invoice" && <FileText className="h-4 w-4 text-purple-500" />}
                            <span className="text-black-500">{form.type}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quotation">
                            <div className="flex items-center gap-2 text-black-500">
                              <Quote className="h-4 w-4 text-cyan-500" />
                              <span>Quotation</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Order">
                            <div className="flex items-center gap-2 text-black-500">
                              <Package className="h-4 w-4 text-blue-500" />
                              <span>Order</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Shipment">
                            <div className="flex items-center gap-2 text-black-500">
                              <Truck className="h-4 w-4 text-orange-500" />
                              <span>Shipment</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Invoice">
                            <div className="flex items-center gap-2 text-black-500">
                              <FileText className="h-4 w-4 text-purple-500" />
                              <span>Invoice</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mb-6">
                      <Label>Number</Label>
                      <div className="flex items-stretch">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">INV-</span>
                        <Input name="number_suffix" value={form.number_suffix} onChange={handleInput} placeholder="Enter transaction number" required className="rounded-l-none h-10" />
                      </div>
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
                  <div>
                    <div className="mb-6">
                      <Label>Invoice Date</Label>
                      <Input type="date" name="invoice_date" value={form.invoice_date} onChange={handleInput} required />
                    </div>

                    <div className="mb-6">
                      <Label>Approver</Label>
                      <Input name="approver" value={form.approver} onChange={handleInput} placeholder="Enter approver name" />
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Input name="status" value={form.status} onChange={handleInput} disabled className="bg-gray-300 text-black cursor-not-allowed" />
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

                  <div className="space-y-4">
                    <Label>Terms & Conditions</Label>
                    <Input name="terms" value={form.terms} onChange={handleInput} placeholder="Enter terms and conditions" />
                  </div>

                  <div className="space-y-4 col-span-2">
                    <Label>Vendor COA</Label>
                    <CoaSelect valueId={form.customer_COA_id} valueLabel={form.customer_COA} onSelect={(id, label) => setForm((p: any) => ({ ...p, customer_COA_id: id, customer_COA: label }))} placeholder="Select Vendor COA" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesItemsForm items={form.items} setItems={setItems} showSku={true} showItemCoa={true} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Additional Costs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Freight Out (Shipping)</Label>
                    <Input type="number" name="freight_out" value={form.freight_out} onChange={handleInput} />
                  </div>
                  <div>
                    <Label>Insurance</Label>
                    <Input type="number" name="insurance" value={form.insurance} onChange={handleInput} />
                  </div>
                  <div className="col-span-2 flex justify-end mt-2 text-sm text-muted-foreground">
                    <div>
                      <span>Total Additional Cost: </span>
                      <span className="font-medium">Rp {((Number(form.freight_out) || 0) + (Number(form.insurance) || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">Subtotal (Items - Return)</div>
                  <div className="text-lg font-bold">Rp {calculateTotal().toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">Subtotal + Additional</div>
                  <div className="text-lg font-bold">Rp {(calculateTotal() + (Number(form.freight_out) || 0) + (Number(form.insurance) || 0)).toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <SalesTaxCalculation subtotal={calculateTotal() + (Number(form.freight_out) || 0) + (Number(form.insurance) || 0)} onTaxChange={handleTaxChange} onTaxMethodChange={handleTaxMethodChange} />
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
                  <div className="flex flex-col items-end justify-end">{/* Grand Total moved outside card */}</div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <div className="text-lg font-bold">Grand Total</div>
                <div className="text-lg font-bold">Rp {taxDetails.grandTotal.toLocaleString()}</div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => navigate("/sales/invoices")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Create Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
