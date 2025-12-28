import React, { useState, useEffect } from "react";
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
import { Switch } from "../../components/ui/switch";
import { FileText, Truck, Package, Tag, AlertCircle, Quote } from "lucide-react";

// TODO: Import AlertDialog, toast, and other UI as needed

const defaultItem = {
  item_name: "",
  memo: "",
  qty: 1,
  unit: "pcs",
  return_qty: 0,
  price: 0,
  disc_item: 0,
  disc_item_type: "percentage",
};

// (ErrorBoundary removed during debugging)

export default function CreateSalesQuotation() {
  // default dates: today and one month ahead
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const todayStr = formatDate(today);
  const oneMonth = new Date(today);
  oneMonth.setMonth(oneMonth.getMonth() + 1);
  const oneMonthStr = formatDate(oneMonth);
  // Form state
  const [form, setForm] = useState({
    type: "Quotation",
    number_suffix: "",
    status: "Pending",
    quotation_date: todayStr,
    due_date: oneMonthStr,
    tags: "",
    customer_name: "",
    start_date: oneMonthStr,
    customer_address: "",
    valid_until: oneMonthStr,
    customer_phone: "",
    terms: "",
    memo: "",
    attachment_url: null,
    total: 0,
    items: [defaultItem],
    tax_details: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const navigate = useNavigate();

  // Handler helpers
  const handleInput = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // items are managed by SalesItemsForm via setForm
  const setItems = (items) => setForm((prev) => ({ ...prev, items }));

  // no auto-generation for number suffix; user inputs suffix only

  // Calculate total
  const calculateTotal = () => {
    return form.items.reduce((sum, item) => {
      const price = Number(item.price || 0) * Number(item.qty || 1);
      const ret = Number(item.return_qty || 0) * Number(item.price || 0);
      const disc = item.disc_item_type === "percentage" ? (price * Number(item.disc_item || 0)) / 100 : Number(item.disc_item || 0);
      return sum + (price - disc - ret);
    }, 0);
  };

  // Tax calculation removed for quotation flow

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const total = calculateTotal();
    const formData = new FormData();
    formData.append("action", "addNewQuotation");
    formData.append("type", form.type);
    formData.append("number", form.number_suffix);
    formData.append("status", "Pending");
    formData.append("quotation_date", form.quotation_date);
    formData.append("due_date", form.due_date);
    formData.append("tags", form.tags);
    formData.append("customer_name", form.customer_name);
    formData.append("start_date", form.start_date);
    formData.append("customer_address", form.customer_address);
    formData.append("valid_until", form.valid_until);
    formData.append("customer_phone", form.customer_phone);
    formData.append("terms", form.terms);
    formData.append("memo", form.memo);
    formData.append("total", total.toString());
    formData.append("items", JSON.stringify(form.items));
    formData.append("tax_details", JSON.stringify(form.tax_details));
    if (form.attachment_url) {
      formData.append("attachment_url", form.attachment_url);
    }
    // append remaining fields requested
    formData.append("type", form.type);
    formData.append("number", form.number_suffix);
    // ensure status is Pending for quotations
    formData.append("status", "Pending");
    formData.append("customer_address", form.customer_address);
    formData.append("customer_phone", form.customer_phone);
    formData.append("start_date", form.start_date);
    // Helper to read auth token (same pattern as other create flows)
    const getAuthToken = () => {
      const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
      if (!authDataRaw) {
        throw new Error("No access token found in localStorage");
      }
      const authData = JSON.parse(authDataRaw);
      const token = authData.access_token;
      if (!token) {
        throw new Error("Access token missing in parsed auth data");
      }
      return token;
    };

    try {
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
        const msg = data?.message || "Failed to create quotation";
        toast.error(msg);
        return;
      }

      toast.success("Quotation created successfully");
      navigate("/sales/quotations");
    } catch (err: any) {
      const msg = err?.message || "Failed to create quotation";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render
  return (
    <div className="flex w-full">
      <Sidebar />
      <div className="flex-1">
        <Header title="Create New Sales Quotation" description="Create a sales quotation" />
        <div className="p-6 overflow-auto max-h-[calc(100vh-6rem)]">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kotak pertama - make it match Purchase Information styling */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-4">Quotation Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <Label>Type</Label>
                      {/* Type select with icons similar to PurchaseInformationForm */}
                      <Select
                        value={form.type}
                        onValueChange={(v) => {
                          if (v === "Order") {
                            navigate("/create-sales-order");
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
                          setForm((p) => ({ ...p, type: v }));
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
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">QUO-</span>
                        <Input name="number_suffix" value={form.number_suffix} onChange={handleInput} placeholder="Enter the transaction number" required className="rounded-l-none h-10" />
                      </div>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Input name="status" value={"Pending"} disabled className="bg-gray-300 text-black cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <Label>Quotation Date</Label>
                      <Input type="date" name="quotation_date" value={form.quotation_date} onChange={handleInput} required />
                    </div>

                    <div className="mb-6">
                      <Label>Due Date</Label>
                      <Input type="date" name="due_date" value={form.due_date} onChange={handleInput} required />
                    </div>

                    <div>
                      <Label>Tags (comma separated)</Label>
                      <Input name="tags" value={form.tags} onChange={handleInput} placeholder="tag1, tag2, tag3" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Kotak kedua */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Customer & Quotation Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="mb-6">
                      <Label>Customer Name</Label>
                      <Input name="customer_name" value={form.customer_name} onChange={handleInput} required placeholder="Enter customer name" />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" name="start_date" value={form.start_date} onChange={handleInput} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <Label>Customer Address</Label>
                      <Input name="customer_address" value={form.customer_address} onChange={handleInput} placeholder="Enter customer address" />
                    </div>
                    <div>
                      <Label>Valid Until</Label>
                      <Input type="date" name="valid_until" value={form.valid_until} onChange={handleInput} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <Label>Customer Phone</Label>
                      <Input name="customer_phone" value={form.customer_phone} onChange={handleInput} placeholder="Enter customer phone" />
                    </div>
                    <div>
                      <Label>Terms & Conditions</Label>
                      <Input name="terms" value={form.terms} onChange={handleInput} placeholder="Enter the terms" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Kotak ketiga: Items (reused SalesItemsForm) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesItemsForm items={form.items} setItems={setItems} showReturn={false} />
                </CardContent>
              </Card>

              {/* Tax Calculation removed for quotation */}
              {/* Kotak berikutnya: Memo, Attachment, Grand Total */}
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
                    {/* Buttons moved below Grand Total */}
                    <div />
                  </div>
                </CardContent>
              </Card>
              <div className="mt-4 border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Grand Total</div>
                  <div className="text-xl font-bold">Rp {calculateTotal().toLocaleString()}</div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => navigate("/sales/quotations")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Create Quotation
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
// default export already declared at function definition
