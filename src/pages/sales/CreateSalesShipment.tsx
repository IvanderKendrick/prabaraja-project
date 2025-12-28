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

export default function CreateSalesShipment() {
  const navigate = useNavigate();

  const formatDate = (d) => d.toISOString().split("T")[0];
  const todayStr = formatDate(new Date());

  const oneMonth = new Date();
  oneMonth.setMonth(oneMonth.getMonth() + 1);
  const oneMonthStr = formatDate(oneMonth);

  const [form, setForm] = useState({
    type: "Shipment",
    number_suffix: "",
    status: "Pending",
    shipping_date: todayStr,
    due_date: oneMonthStr,
    tracking_number: "",
    carrier: "",
    tags: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    items: [defaultItem],
    memo: "",
    attachment_url: null,
    tax_method: "Before Calculate",
    ppn_percentage: "11",
    pph_type: "pph23",
    pph_percentage: "2",
    dpp: 0,
    ppn: 0,
    pph: 0,
    total: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxDetails, setTaxDetails] = useState({ dpp: 0, ppn: 0, pph: 0, grandTotal: 0 });

  const handleInput = (e) => {
    const { name, value, type, files } = e.target;

    if (name === "shipping_date") {
      const sd = new Date(value);
      const dd = new Date(sd);
      dd.setMonth(dd.getMonth() + 1);
      setForm((p) => ({ ...p, shipping_date: value, due_date: formatDate(dd) }));
      return;
    }

    setForm((p) => ({
      ...p,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const setItems = (items) => setForm((p) => ({ ...p, items }));

  const calculateSubtotal = () =>
    form.items.reduce((sum, item) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);
      const base = qty * price;

      const discount = item.disc_item_type === "percentage" ? (base * Number(item.disc_item || 0)) / 100 : Number(item.disc_item || 0);

      const retur = Number(item.return_qty || 0) * price;
      return sum + (base - discount - retur);
    }, 0);

  const handleTaxChange = (data) => {
    setTaxDetails(data);
    setForm((p) => ({
      ...p,
      dpp: data.dpp,
      ppn: data.ppn,
      pph: data.pph,
      total: data.grandTotal,
    }));
  };

  const getAuthToken = () => {
    const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (!raw) throw new Error("Token not found");
    return JSON.parse(raw).access_token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const subtotal = calculateSubtotal();
      const fd = new FormData();

      Object.entries({
        action: "addNewShipment",
        type: "Shipment",
        number: form.number_suffix,
        status: form.status,
        date: form.shipping_date,
        shipping_date: form.shipping_date,
        due_date: form.due_date,
        tracking_number: form.tracking_number,
        carrier: form.carrier,
        tags: form.tags,
        customer_name: form.customer_name,
        customer_address: form.customer_address,
        customer_phone: form.customer_phone,
        items: JSON.stringify(form.items),
        memo: form.memo,
        tax_method: form.tax_method,
        ppn_percentage: form.ppn_percentage,
        pph_type: form.pph_type,
        pph_percentage: form.pph_percentage,
        dpp: taxDetails.dpp,
        ppn: taxDetails.ppn,
        pph: taxDetails.pph,
        total: taxDetails.grandTotal || subtotal,
        grand_total: taxDetails.grandTotal || subtotal,
      }).forEach(([k, v]) => fd.append(k, String(v ?? "")));

      if (form.attachment_url) fd.append("attachment_url", form.attachment_url);

      const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Create shipment failed");

      toast.success("Shipment created successfully");
      navigate("/sales/shipments");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Create New Sales Shipment" description="Create a sales shipment" />

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Shipment Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={form.type}
                        onValueChange={(v) => {
                          if (v === "Quotation") navigate("/create-sales");
                          else if (v === "Order") navigate("/create-sales-order");
                          else if (v === "Invoice") navigate("/create-sales-invoice");
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

                    <div>
                      <Label>Number</Label>
                      <div className="flex items-stretch">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">SH-</span>
                        <Input name="number_suffix" value={form.number_suffix} onChange={handleInput} required className="rounded-l-none h-10" placeholder="Enter transaction number" />
                      </div>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Input name="status" value={"Pending"} disabled className="bg-gray-300 text-black cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Shipment Date</Label>
                      <Input name="shipping_date" type="date" value={form.shipping_date} onChange={handleInput} />
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input name="due_date" type="date" value={form.due_date} onChange={handleInput} />
                    </div>
                    <div>
                      <Label>Tags (comma separated)</Label>
                      <Input name="tags" value={form.tags} onChange={handleInput} placeholder="tag1, tag2, tag3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Customer Name</Label>
                    <Input name="customer_name" value={form.customer_name} onChange={handleInput} placeholder="Enter customer name" />
                  </div>
                  <div>
                    <Label>Customer Address</Label>
                    <Input name="customer_address" value={form.customer_address} onChange={handleInput} placeholder="Enter customer address" />
                  </div>
                  <div>
                    <Label>Customer Phone</Label>
                    <Input name="customer_phone" value={form.customer_phone} onChange={handleInput} placeholder="Enter customer phone" />
                  </div>
                </CardContent>
              </Card>

              {/* Shipment Details */}
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
                    <Input name="shipping_date" type="date" value={form.shipping_date} onChange={handleInput} />
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesItemsForm items={form.items} setItems={setItems} showSku returnFieldName="return_qty" />
                </CardContent>
              </Card>

              {/* Subtotal (Items - Retur) - emphasized, not in card */}
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold">Subtotal (Items - Retur)</div>
                <div className="text-lg font-bold">Rp {calculateSubtotal().toLocaleString()}</div>
              </div>

              {/* Tax calculation (existing) */}
              <SalesTaxCalculation subtotal={calculateSubtotal()} onTaxChange={handleTaxChange} onTaxMethodChange={(m) => setForm((p) => ({ ...p, tax_method: m }))} />

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Additional Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Memo</Label>
                    <Textarea name="memo" value={form.memo} onChange={handleInput} placeholder="Enter memo here..." />
                  </div>
                  <div className="col-span-2">
                    <Label>Attachment (optional)</Label>
                    <Input name="attachment_url" type="file" onChange={handleInput} />
                  </div>
                </CardContent>
              </Card>

              {/* Grand Total - inline, not in card */}
              <div className="flex w-full items-center justify-between">
                <div className="text-lg font-medium">Grand Total</div>
                <div className="text-xl font-bold">Rp {Number(taxDetails?.grandTotal || calculateSubtotal()).toLocaleString()}</div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate("/sales/shipments")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Create Shipment
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
