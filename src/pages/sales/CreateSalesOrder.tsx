import React, { useState } from "react";
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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const defaultItem = {
  item_name: "",
  memo: "",
  qty: 1,
  unit: "pcs",
  price: 0,
  disc_item: 0,
  disc_item_type: "percentage",
};

export default function CreateSalesOrder() {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const todayStr = formatDate(today);
  const oneMonth = new Date(today);
  oneMonth.setMonth(oneMonth.getMonth() + 1);
  const oneMonthStr = formatDate(oneMonth);

  const [form, setForm] = useState<any>({
    type: "Order",
    number_suffix: "",
    status: "Pending",
    order_date: todayStr,
    due_date: oneMonthStr,
    tags: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    // terms removed per request
    memo: "",
    attachment_url: null,
    total: 0,
    items: [defaultItem],
    tax_details: [],
    unearned_revenue_amount: "",
    urgency_level: "Medium",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      return sum + (price - disc);
    }, 0);
  };

  const [taxDetails, setTaxDetails] = React.useState<any>({ dpp: 0, ppn: 0, pph: 0, grandTotal: 0 });

  const handleTaxChange = (data: any) => setTaxDetails(data);

  const getAuthToken = () => {
    const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (!authDataRaw) throw new Error("No access token found in localStorage");
    const authData = JSON.parse(authDataRaw);
    const token = authData.access_token;
    if (!token) throw new Error("Access token missing in parsed auth data");
    return token;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      const formData = new FormData();

      // Required backend keys per spec
      formData.append("action", "addNewOrder");
      formData.append("customer_name", form.customer_name || "");
      formData.append("customer_phone", form.customer_phone || "");
      formData.append("order_date", form.order_date || "");
      formData.append("due_date", form.due_date || "");
      formData.append("status", form.status || "");
      // tracking_number removed from order payload per backend change
      formData.append("notes", form.memo || "");
      formData.append("items", JSON.stringify(form.items || []));
      formData.append("grand_total", String(taxDetails.grandTotal || total || 0));
      formData.append("memo", form.memo || "");
      if (form.attachment_url) formData.append("attachment_url", form.attachment_url);
      formData.append("type", "Sales Order");
      formData.append("tax_details", JSON.stringify(taxDetails || {}));
      formData.append("customer_address", form.customer_address || "");
      // Map urgency dropdown to `level` key
      formData.append("level", form.urgency_level || "");
      formData.append("unearned_revenue_amount", form.unearned_revenue_amount || "");
      formData.append("urgency_level", form.urgency_level || "");
      // tags (new backend key)
      formData.append("tags", form.tags || "");
      // Tax breakdown fields (new backend keys)
      formData.append("ppn_percentage", String(taxDetails?.ppn_percentage ?? ""));
      formData.append("pph_type", String(taxDetails?.pph_type ?? ""));
      formData.append("pph_percentage", String(taxDetails?.pph_percentage ?? ""));
      formData.append("dpp", String(taxDetails?.dpp ?? ""));
      formData.append("ppn", String(taxDetails?.ppn ?? ""));
      formData.append("pph", String(taxDetails?.pph ?? ""));
      // Ensure backend receives only the numeric part of the number (e.g. 5555), not the ORD- prefix
      const rawNumber = String(form.number_suffix || "");
      const numberOnly = rawNumber.replace(/\D/g, "");
      formData.append("number", numberOnly);

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
        const msg = data?.message || "Failed to create order";
        toast.error(msg);
        return;
      }

      toast.success("Order created successfully");
      navigate("/sales/orders");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Create New Sales Order" description="Create a sales order" />
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Order Info</CardTitle>
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
                          if (v === "Shipment") {
                            navigate("/create-sales-shipment");
                            return;
                          }
                          if (v === "Invoice") {
                            navigate("/create-sales-invoice");
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
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">ORD-</span>
                        <Input name="number_suffix" value={form.number_suffix} onChange={handleInput} placeholder="Enter transaction number" required className="rounded-l-none h-10" />
                      </div>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Input name="status" value={"Pending"} disabled className="bg-gray-300 text-black cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <Label>Order Date</Label>
                      <Input type="date" name="order_date" value={form.order_date} onChange={handleInput} required />
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
                  <CardTitle className="text-lg font-medium">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label>Unearned Revenue Amount</Label>
                    <Input name="unearned_revenue_amount" value={form.unearned_revenue_amount} onChange={handleInput} placeholder="Enter unearned revenue amount if needed" />
                  </div>
                  <div className="space-y-4">
                    <Label>Urgency Level</Label>
                    <Select value={form.urgency_level} onValueChange={(v: any) => setForm((p: any) => ({ ...p, urgency_level: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesItemsForm items={form.items} setItems={setItems} showReturn={false} showSku={true} />
                </CardContent>
              </Card>

              {/* Tax Calculation (subtotal removed) */}
              <div className="space-y-4">
                <SalesTaxCalculation subtotal={calculateTotal()} onTaxChange={handleTaxChange} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Info</CardTitle>
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
                  <div className="text-xl font-bold">Rp {Number(taxDetails?.grandTotal || calculateTotal()).toLocaleString()}</div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => navigate("/sales/orders")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Create Order
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
