import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Building2, Calculator, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { useSalesReceivableSummaryDetail } from "@/hooks/useSalesReceivableSummaryDetail";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { format } from "date-fns";

const ReceivableSummaryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rec, isLoading, error } = useSalesReceivableSummaryDetail(id);

  const handleGoBack = () => navigate("/sales/billing-summary");

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span>Loading receivable summary...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Failed to load receivable summary</h2>
        <p className="text-gray-500">{(error as Error).message}</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  if (!rec)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Receivable Summary Not Found</h2>
        <p className="text-gray-500">The receivable summary you are looking for doesn’t exist or was deleted.</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  const isOverdue = rec.due_date ? new Date() > new Date(rec.due_date) : false;

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

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title={`Receivable ${rec.number || rec.id}`} description={`Details for receivable ${rec.number || rec.id}`} />

        <div className="p-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Basic Information</CardTitle>
              <button onClick={handleGoBack} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2 text-sm font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Receivable Summary
              </button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Customer Name</p>
                <p className="mt-1">{rec.customer_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Invoice Date</p>
                <p className="mt-1">{rec.invoice_date && !isNaN(new Date(rec.invoice_date).getTime()) ? format(new Date(rec.invoice_date), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Transaction Number</p>
                <p className="mt-1">{rec.number || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1">{rec.status || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p className="mt-1">{rec.due_date && !isNaN(new Date(rec.due_date).getTime()) ? format(new Date(rec.due_date), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Terms</p>
                <p className="mt-1">{(rec as any).terms || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Memo</p>
                <p className="mt-1">{(rec as any).memo || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Billing per Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Item Name</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">SKU</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">Quantity</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Unit</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">Price</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">Discount</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">COA</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Memo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.items && rec.items.length > 0 ? (
                      (rec.items as any[]).map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-3 px-3">{item.item_name || item.product_name || item.name}</td>
                          <td className="py-3 px-3">{item.sku || item.product_id || "-"}</td>
                          <td className="py-3 px-3 text-right">{item.qty || item.quantity || 0}</td>
                          <td className="py-3 px-3">{item.unit || "-"}</td>
                          <td className="py-3 px-3 text-right">Rp {formatPriceWithSeparator(item.price || 0)}</td>
                          <td className="py-3 px-3 text-right">{item.disc_item == null ? "-" : item.disc_item_type === "percentage" ? `${item.disc_item}%` : `Rp ${formatPriceWithSeparator(item.disc_item)}`}</td>
                          <td className="py-3 px-3 text-right font-medium">Rp {formatPriceWithSeparator(item.total_per_item || (item.qty || 0) * (item.price || 0))}</td>
                          <td className="py-3 px-3">{item.coa || "-"}</td>
                          <td className="py-3 px-3">{item.memo || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-gray-500">
                          No items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment & Tax</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {/* Left column (1) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <p className="mt-1">{(rec as any).payment_method || "-"}</p>
              </div>

              {/* Right column (1) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Date</p>
                <p className="mt-1">{renderJsonDates((rec as any).payment_date)}</p>
              </div>

              {/* Left column (2) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Customer COA</p>
                <p className="mt-1">{(rec as any).customer_COA || "-"}</p>
              </div>

              {/* Right column (2) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Payment COA</p>
                <p className="mt-1">{(rec as any).payment_coa || (rec as any).payment_COA || "-"}</p>
              </div>

              {/* Left column (3) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Amount</p>
                <p className="mt-1">{renderJsonAmount((rec as any).payment_amount || (rec as any).paid_amount)}</p>
              </div>

              {/* Right column (3) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Name</p>
                <p className="mt-1">{(rec as any).payment_name || "-"}</p>
              </div>

              {/* Left column (4) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Installment Type</p>
                <p className="mt-1">{(rec as any).installment_type || "-"}</p>
              </div>

              {/* Right column (4) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Tax Method</p>
                <p className="mt-1">{(rec as any).tax_method || "-"}</p>
              </div>

              {/* Left column (5) */}
              <div>
                <p className="text-sm font-medium text-gray-500">PPN</p>
                <p className="mt-1">Rp {formatPriceWithSeparator((rec as any).ppn || 0)}</p>
              </div>

              {/* Right column (5) */}
              <div>
                <p className="text-sm font-medium text-gray-500">PPN Percentage</p>
                <p className="mt-1">{(rec as any).ppn_percentage != null ? `${(rec as any).ppn_percentage}%` : "-"}</p>
              </div>

              {/* Left column (6) */}
              <div>
                <p className="text-sm font-medium text-gray-500">PPh</p>
                <p className="mt-1">Rp {formatPriceWithSeparator((rec as any).pph || 0)}</p>
              </div>

              {/* Right column (6) */}
              <div>
                <p className="text-sm font-medium text-gray-500">PPh Type</p>
                <p className="mt-1">{(rec as any).pph_type || "-"}</p>
              </div>

              {/* Left column (7) */}
              <div>
                <p className="text-sm font-medium text-gray-500">PPh Percentage</p>
                <p className="mt-1">{(rec as any).pph_percentage != null ? `${(rec as any).pph_percentage}%` : "-"}</p>
              </div>

              {/* Right column (7) */}
              <div>
                <p className="text-sm font-medium text-gray-500">DPP</p>
                <p className="mt-1">Rp {formatPriceWithSeparator((rec as any).dpp || 0)}</p>
              </div>

              {/* Left column (8) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="mt-1">Rp {formatPriceWithSeparator((rec as any).total || 0)}</p>
              </div>

              {/* Right column (8) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Grand Total</p>
                <p className="mt-1 font-bold">Rp {formatPriceWithSeparator((rec as any).grand_total || (rec as any).total || 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReceivableSummaryDetail;
