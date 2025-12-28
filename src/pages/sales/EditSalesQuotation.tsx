import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Loader2, FileText, Truck, Package, Quote } from "lucide-react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import SalesItemsForm from "../../components/sales/SalesItemsForm";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";

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

export default function EditSalesQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    id: "",
    type: "Quotation",
    number_suffix: "",
    status: "",
    quotation_date: "",
    due_date: "",
    tags: "",
    customer_name: "",
    start_date: "",
    customer_address: "",
    valid_until: "",
    customer_phone: "",
    terms: "",
    memo: "",
    attachment_url: null,
    total: 0,
    items: [defaultItem],
    tax_details: [],
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInput = (e: any) => {
    const { name, value, type, files } = e.target;
    setForm((p: any) => ({ ...p, [name]: type === "file" ? files[0] : value }));
  };

  const setItems = (items: any) => setForm((p: any) => ({ ...p, items }));

  const getAuthToken = () => {
    const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (!raw) throw new Error("No access token");
    return JSON.parse(raw).access_token;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`https://pbw-backend-api.vercel.app/api/sales?action=getQuotation&search=${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        const item = Array.isArray(json?.data) ? json.data[0] : json?.data?.[0] || json?.data;
        if (!item) throw new Error("Quotation not found");
        setForm((p: any) => ({
          ...p,
          id: item.id,
          type: item.type || "Quotation",
          number_suffix: typeof item.number === "string" && item.number.startsWith("QUO-") ? item.number.replace(/^QUO-/, "") : item.number ?? "",
          status: item.status ?? "",
          quotation_date: item.quotation_date ?? "",
          due_date: item.due_date ?? item.valid_until ?? "",
          tags: Array.isArray(item.tags) ? item.tags.join(",") : item.tags ?? "",
          customer_name: item.customer_name ?? "",
          start_date: item.start_date ?? "",
          customer_address: item.customer_address ?? "",
          valid_until: item.valid_until ?? "",
          customer_phone: item.customer_phone ?? "",
          terms: item.terms ?? "",
          memo: item.memo ?? "",
          attachment_url: item.attachment_url ?? null,
          items: item.items ?? [defaultItem],
          tax_details: item.tax_details ?? [],
          total: item.total ?? item.grand_total ?? 0,
        }));
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to load quotation");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const calculateTotal = () => {
    return form.items.reduce((sum: number, item: any) => {
      const price = Number(item.price || 0) * Number(item.qty || 1);
      const ret = Number(item.return_qty || 0) * Number(item.price || 0);
      const disc = item.disc_item_type === "percentage" ? (price * Number(item.disc_item || 0)) / 100 : Number(item.disc_item || 0);
      return sum + (price - disc - ret);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      const apiForm = new FormData();
      apiForm.append("action", "editNewQuotation");
      apiForm.append("id", form.id || id || "");
      apiForm.append("type", form.type || "Quotation");
      apiForm.append("number", String(form.number_suffix || ""));
      apiForm.append("status", form.status || "");
      apiForm.append("quotation_date", form.quotation_date || "");
      apiForm.append("due_date", form.due_date || "");
      apiForm.append("tags", form.tags || "");
      apiForm.append("customer_name", form.customer_name || "");
      apiForm.append("start_date", form.start_date || "");
      apiForm.append("customer_address", form.customer_address || "");
      apiForm.append("valid_until", form.valid_until || "");
      apiForm.append("customer_phone", form.customer_phone || "");
      apiForm.append("terms", form.terms || "");
      apiForm.append("memo", form.memo || "");
      apiForm.append("total", String(total || 0));
      apiForm.append("items", JSON.stringify(form.items || []));
      apiForm.append("tax_details", JSON.stringify(form.tax_details || []));
      if (form.attachment_url && typeof form.attachment_url !== "string") apiForm.append("attachment_url", form.attachment_url);
      apiForm.append("filesToDelete", typeof form.attachment_url === "string" ? form.attachment_url : "");

      const token = getAuthToken();
      const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: apiForm,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.error) throw new Error(data?.message || "Failed to update quotation");

      toast.success("Quotation updated");
      navigate("/sales/quotations");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading quotation details...
      </div>
    );

  return (
    <div className="flex w-full">
      <Sidebar />
      <div className="flex-1">
        <Header title="Edit Sales Quotation" description="Edit an existing sales quotation" />
        <div className="p-6 overflow-auto max-h-[calc(100vh-6rem)]">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-4">Quotation Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <Label>Type</Label>
                      <Select value={form.type} disabled>
                        <SelectTrigger className="bg-gray-300 text-black cursor-not-allowed">
                          <div className="flex items-center gap-2">
                            {form.type === "Quotation" && <Quote className="h-4 w-4 text-cyan-500" />}
                            {form.type === "Order" && <Package className="h-4 w-4 text-blue-500" />}
                            {form.type === "Shipment" && <Truck className="h-4 w-4 text-orange-500" />}
                            {form.type === "Invoice" && <FileText className="h-4 w-4 text-purple-500" />}
                            <span className="text-black-500">{form.type}</span>
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
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-sm h-10">QUO-</span>
                        <Input name="number_suffix" value={form.number_suffix} disabled placeholder="Enter the transaction number" required className="rounded-l-none h-10 bg-gray-300 text-black cursor-not-allowed" />
                      </div>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Input name="status" value={form.status} disabled className="bg-gray-300 text-black cursor-not-allowed" />
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesItemsForm items={form.items} setItems={setItems} showReturn={false} />
                </CardContent>
              </Card>

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
                  <div className="text-xl font-bold">Rp {calculateTotal().toLocaleString()}</div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Quotation"}
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
