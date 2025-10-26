import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceWithSeparator } from "@/utils/salesUtils";

interface InvoiceItem {
  coa?: string;
  qty: number;
  sku: string;
  memo?: string;
  unit: string;
  price: number;
  disc_item: number;
  item_name: string;
  addToStock?: boolean;
  return_unit?: number;
  disc_item_type: "percentage" | "rupiah";
}

interface BillingInvoiceDetails {
  id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  vendor_name?: string;
  invoice_date?: string;
  terms?: string;
  grand_total?: number;
  items?: InvoiceItem[];
  payment_method?: string;
  payment_COA?: string;
  vendor_COA?: string;
  type?: string;
  number?: string;
  status?: string;
  memo?: string;
  attachment_url?: string;
  payment_date?: unknown; // jsonb nullable
  due_date?: string;
  installment_count?: number | null;
  installment_type?: string;
  ppn?: number;
  pph_type?: string;
  pph?: number;
  dpp?: number;
  tax_method?: string;
  ppn_percentage?: string | number;
  pph_percentage?: string | number;
  total?: number;
  payment_amount?: unknown; // jsonb nullable
  paid_amount?: number | null;
  payment_name?: string;
}

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!authDataRaw) throw new Error("No access token found in localStorage");
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) throw new Error("Access token missing in parsed auth data");
  return token;
};

const ViewBillingInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BillingInvoiceDetails | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error("No invoice ID provided");

        const token = getAuthToken();
        const url = new URL("https://pbw-backend-api.vercel.app/api/purchases");
        url.searchParams.set("action", "getBillingInvoice");
        url.searchParams.set("search", id || "");

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        if (json.error) throw new Error(json.message || "Failed to fetch billing invoice");

        // response contains data as array - take first
        const invoice = json.data?.[0] || null;
        if (!invoice) throw new Error("No data received from server");

        setData(invoice);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInvoice();
  }, [id]);

  // Attachments display removed per UI request

  const renderJsonDates = (value: unknown) => {
    if (!value) return "-";
    try {
      const formatMaybeDate = (v: unknown) => {
        if (!v) return String(v);
        if (typeof v === "string" && !isNaN(new Date(v).getTime())) return format(new Date(v), "dd/MM/yyyy");
        return String(v);
      };

      if (Array.isArray(value)) {
        return value
          .map((d) => {
            if (typeof d === "string") return formatMaybeDate(d);
            if (typeof d === "object" && d !== null) {
              // extract first string-like value inside object
              const record = d as Record<string, unknown>;
              for (const k in record) {
                const v = record[k];
                if (typeof v === "string") return formatMaybeDate(v);
              }
              return JSON.stringify(d);
            }
            return formatMaybeDate(d);
          })
          .join(", ");
      }

      if (typeof value === "string" && value.startsWith("[")) {
        const arr = JSON.parse(value);
        if (Array.isArray(arr))
          return arr
            .map((d) => {
              if (typeof d === "string") return formatMaybeDate(d);
              if (typeof d === "object" && d !== null) {
                const record = d as Record<string, unknown>;
                for (const k in record) {
                  const v = record[k];
                  if (typeof v === "string") return formatMaybeDate(v);
                }
                return JSON.stringify(d);
              }
              return formatMaybeDate(d);
            })
            .join(", ");
      }

      if (typeof value === "string" && !isNaN(new Date(value).getTime())) return format(new Date(value), "dd/MM/yyyy");
      return String(value);
    } catch (e) {
      return String(value);
    }
  };

  const renderJsonAmount = (value: unknown) => {
    if (value == null) return "-";
    try {
      const formatMaybeNumber = (v: unknown) => {
        if (v == null) return 0;
        if (typeof v === "number") return v;
        if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
        return 0;
      };

      if (Array.isArray(value))
        return value
          .map((v) => {
            if (typeof v === "number") return `Rp ${formatPriceWithSeparator(v)}`;
            if (typeof v === "string" && v.trim().startsWith("[")) {
              try {
                const parsed = JSON.parse(v);
                if (Array.isArray(parsed)) return parsed.map((p) => `Rp ${formatPriceWithSeparator(formatMaybeNumber(p))}`).join(", ");
              } catch {
                // fallthrough
              }
            }
            if (typeof v === "object" && v !== null) {
              const record = v as Record<string, unknown>;
              for (const k in record) {
                const val = record[k];
                const num = formatMaybeNumber(val);
                return `Rp ${formatPriceWithSeparator(num)}`;
              }
              return `Rp 0`;
            }
            return `Rp ${formatPriceWithSeparator(formatMaybeNumber(v))}`;
          })
          .join(", ");

      if (typeof value === "string" && value.startsWith("[")) {
        const arr = JSON.parse(value);
        if (Array.isArray(arr)) return arr.map((v) => `Rp ${formatPriceWithSeparator(formatMaybeNumber(v))}`).join(", ");
      }

      return `Rp ${formatPriceWithSeparator(formatMaybeNumber(value))}`;
    } catch (e) {
      return String(value);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!data) return <div className="text-gray-500 p-4">No invoice data found</div>;

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title="View Billing Invoice" description={`Details for invoice ${data.number}`} />

        <div className="p-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Basic Information</CardTitle>
              <button onClick={() => navigate("/billing-summary")} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2 text-sm font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Billing Summary
              </button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Vendor Name</p>
                <p className="mt-1">{data.vendor_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Invoice Date</p>
                <p className="mt-1">{data.invoice_date && !isNaN(new Date(data.invoice_date).getTime()) ? format(new Date(data.invoice_date), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Transaction Number</p>
                <p className="mt-1">{data.number || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1">{data.status || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p className="mt-1">{data.due_date && !isNaN(new Date(data.due_date).getTime()) ? format(new Date(data.due_date), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Terms</p>
                <p className="mt-1">{data.terms || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Memo</p>
                <p className="mt-1">{data.memo || "-"}</p>
              </div>
              <div className="col-span-2">{/* Attachments removed as per UI request */}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Billing per Item</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>COA</TableHead>
                    <TableHead>Memo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items && data.items.length > 0 ? (
                    data.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>Rp {formatPriceWithSeparator(item.price)}</TableCell>
                        <TableCell>
                          {item.disc_item} {item.disc_item_type === "percentage" ? "%" : "Rp"}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const total = item.qty * item.price - (item.disc_item_type === "percentage" ? item.qty * item.price * (item.disc_item / 100) : item.disc_item);
                            return `Rp ${formatPriceWithSeparator(Math.round(total))}`;
                          })()}
                        </TableCell>
                        <TableCell>{item.coa || "-"}</TableCell>
                        <TableCell>{item.memo || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9}>No items</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment & Tax</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <p className="mt-1">{data.payment_method || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Date</p>
                <p className="mt-1">{renderJsonDates(data.payment_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vendor COA</p>
                <p className="mt-1">{data.vendor_COA || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment COA</p>
                <p className="mt-1">{data.payment_COA || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Amount</p>
                <p className="mt-1">{renderJsonAmount(data.payment_amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Name</p>
                <p className="mt-1">{data.payment_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Installment Type</p>
                <p className="mt-1">{data.installment_type ? data.installment_type : "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tax Method</p>
                <p className="mt-1">{data.tax_method || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">PPN</p>
                <p className="mt-1">Rp {formatPriceWithSeparator(data.ppn || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">PPN Percentage</p>
                <p className="mt-1">{data.ppn_percentage ?? "-"}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">PPh</p>
                <p className="mt-1">Rp {formatPriceWithSeparator(data.pph || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">PPh Type</p>
                <p className="mt-1">{data.pph_type || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">PPh Percentage</p>
                <p className="mt-1">{data.pph_percentage ?? "-"}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">DPP</p>
                <p className="mt-1">Rp {formatPriceWithSeparator(data.dpp || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="mt-1">Rp {formatPriceWithSeparator(data.total || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Grand Total</p>
                <p className="mt-1 font-bold">Rp {formatPriceWithSeparator(data.grand_total || 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewBillingInvoice;
