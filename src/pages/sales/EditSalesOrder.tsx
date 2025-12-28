import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Loader2, FileText, Truck, Package, Quote } from "lucide-react";
import { SalesTaxCalculation } from "@/components/sales/SalesTaxCalculation";

const defaultItem = {
  item_name: "",
  memo: "",
  qty: 1,
  unit: "pcs",
  price: 0,
  disc_item: 0,
  disc_item_type: "percentage",
};

export default function EditSalesOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const todayStr = formatDate(new Date());
  const oneMonth = new Date();
  oneMonth.setMonth(oneMonth.getMonth() + 1);
  const oneMonthStr = formatDate(oneMonth);

  const [form, setForm] = useState({
    id: "",
    type: "Order",
    number_suffix: "",
    status: "Pending",
    order_date: todayStr,
    due_date: oneMonthStr,
    tags: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    memo: "",
    attachment_url: null,
    items: [defaultItem],
    unearned_revenue_amount: "",
    urgency_level: "Medium",
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxDetails, setTaxDetails] = useState({ dpp: 0, ppn: 0, pph: 0, grandTotal: 0 });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement & { files?: FileList };
    const name = target.name;
    const type = target.type;
    const value: any = type === "file" ? target.files && target.files[0] : target.value;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const setItems = (items) => setForm((p) => ({ ...p, items }));

  const calculateTotal = () =>
    form.items.reduce((sum, item) => {
      const base = Number(item.qty || 0) * Number(item.price || 0);
      const disc = item.disc_item_type === "percentage" ? (base * Number(item.disc_item || 0)) / 100 : Number(item.disc_item || 0);
      return sum + (base - disc);
    }, 0);

  const getAuthToken = (): string | null => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.access_token ?? null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          toast.error("You are not authenticated. Please login.");
          setLoading(false);
          return;
        }

        const res = await fetch(`https://pbw-backend-api.vercel.app/api/sales?action=getOrder&search=${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        const item = Array.isArray(json?.data) ? json.data[0] : json?.data;
        if (!item) throw new Error("Order not found");

        setForm({
          id: item.id,
          type: "Order",
          number_suffix: String(item.number || "").replace(/^ORD-/, ""),
          status: item.status || "Pending",
          order_date: item.order_date || todayStr,
          due_date: item.due_date || oneMonthStr,
          tags: Array.isArray(item.tags) ? item.tags.join(",") : item.tags || "",
          customer_name: item.customer_name || "",
          customer_address: item.customer_address || "",
          customer_phone: item.customer_phone || "",
          memo: item.memo || "",
          attachment_url: item.attachment_url || null,
          items: item.items || [defaultItem],
          unearned_revenue_amount: item.unearned_revenue_amount || "",
          urgency_level: item.level || "Medium",
        });
      } catch (err: any) {
        toast.error(err?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const total = calculateTotal();
      const fd = new FormData();

      fd.append("action", "editNewOrder");
      fd.append("id", form.id || id);
      fd.append("type", "Order");
      fd.append("customer_name", form.customer_name);
      fd.append("customer_phone", form.customer_phone);
      fd.append("customer_address", form.customer_address);
      fd.append("order_date", form.order_date);
      fd.append("due_date", form.due_date);
      fd.append("status", form.status);
      fd.append("memo", form.memo);
      fd.append("items", JSON.stringify(form.items));
      fd.append("tax_details", JSON.stringify(taxDetails));
      fd.append("grand_total", String(taxDetails.grandTotal || total));
      fd.append("level", form.urgency_level);
      fd.append("unearned_revenue_amount", form.unearned_revenue_amount);
      fd.append("number", String(form.number_suffix).replace(/\D/g, ""));

      if (form.attachment_url instanceof File) {
        fd.append("attachment_url", form.attachment_url);
      }

      const token = getAuthToken();
      if (!token) {
        toast.error("You are not authenticated. Please login.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("https://pbw-backend-api.vercel.app/api/sales", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");

      toast.success("Order updated");
      navigate("/sales/orders");
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading order...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Edit Sales Order" description="Edit existing sales order" />

        <form onSubmit={handleSubmit} className="p-6 max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Order Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-6">
                  <Label>Type</Label>
                  <Select value="Order" disabled>
                    <SelectTrigger className="bg-gray-300 text-black cursor-not-allowed">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span>Order</span>
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
                    <Input value={form.number_suffix} disabled className="rounded-l-none h-10 bg-gray-300 text-black cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Input name="status" value={form.status} disabled className="bg-gray-300 text-black cursor-not-allowed" />
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <Label>Order Date</Label>
                  <Input type="date" name="order_date" value={form.order_date} onChange={handleInput} />
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesItemsForm items={form.items} setItems={setItems} showReturn={false} showSku={true} />
            </CardContent>
          </Card>

          <SalesTaxCalculation subtotal={calculateTotal()} onTaxChange={setTaxDetails} />

          <Card>
            <CardHeader>
              <CardTitle>Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Memo</Label>
                <Textarea name="memo" value={form.memo} onChange={handleInput} />
              </div>
              <div>
                <Label>Attachment (optional)</Label>
                <Input name="attachment_url" type="file" onChange={handleInput} />
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Grand Total</div>
              <div className="text-xl font-bold">Rp {Number(taxDetails?.grandTotal || calculateTotal() || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
