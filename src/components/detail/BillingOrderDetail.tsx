import { useParams, useNavigate } from "react-router-dom";
import { Calculator, Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPriceWithSeparator } from "@/utils/salesUtils";
import { useSalesBillingOrderDetail } from "@/hooks/useSalesBillingOrderDetail";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const BillingOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: bo, isLoading } = useSalesBillingOrderDetail(id);

  const handleGoBack = () => navigate("/sales/billing-summary?tab=order");

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span>Loading billing order...</span>
      </div>
    );

  const isOverdue = bo && bo.due_date ? new Date(bo.due_date) < new Date() && bo.status !== "Paid" : false;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title={`View Billing Order`} description={`Details for billing order ${bo?.number || "-"}`} />

        <div className="p-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Basic Information</CardTitle>
              <button onClick={handleGoBack} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2 text-sm font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Billing Order
              </button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Customer Name</p>
                <p className="mt-1">{bo?.customer_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Order Date</p>
                <p className="mt-1">{bo?.order_date ? new Date(bo.order_date).toLocaleDateString() : "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Transaction Number</p>
                <p className="mt-1">{bo?.number || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={bo?.status === "Paid" ? "bg-green-100 text-green-800" : bo?.status === "Cancelled" ? "bg-red-100 text-red-800" : isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                  {isOverdue ? "Overdue" : bo?.status || "-"}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Memo</p>
                <p className="mt-1">{bo?.memo || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" /> Detailed Billing Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Item Name</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">SKU</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Quantity</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Unit</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Price</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Discount</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(bo?.items || []).length > 0 ? (
                          (bo!.items || []).map((item: any, i: number) => (
                            <tr key={i} className="border-b">
                              <td className="py-3 px-3">{item.product_name || item.item_name || item.name}</td>
                              <td className="py-3 px-3">{item.product_id || item.sku || "-"}</td>
                              <td className="py-3 px-3 text-right">{item.quantity || item.qty || 0}</td>
                              <td className="py-3 px-3">{item.unit || "pcs"}</td>
                              <td className="py-3 px-3 text-right">Rp {formatPriceWithSeparator(item.price || 0)}</td>
                              <td className="py-3 px-3 text-right">{item.discount == null ? "-" : `Rp ${formatPriceWithSeparator(item.discount)}`}</td>
                              <td className="py-3 px-3 text-right font-medium">Rp {formatPriceWithSeparator(item.total_per_item || (item.quantity || item.qty || 0) * (item.price || 0))}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-gray-500">
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 space-y-2 border-t pt-4">
                    {bo?.tax_details && (
                      <Card className="mb-4">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Tax Calculation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            {bo.tax_details.dpp && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">DPP/VOT:</span>
                                <span className="font-medium">Rp {formatPriceWithSeparator(bo.tax_details.dpp)}</span>
                              </div>
                            )}
                            {bo.tax_details.ppn && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">PPN (VAT):</span>
                                <span className="font-medium">Rp {formatPriceWithSeparator(bo.tax_details.ppn)}</span>
                              </div>
                            )}
                            {bo.tax_details.pph && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">PPh:</span>
                                <span className="font-medium">Rp {formatPriceWithSeparator(bo.tax_details.pph)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-sm text-gray-600">Account Receivable Name</p>
                    <p className="font-medium">{(bo as any)?.account_receivable_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Receivable COA</p>
                    <p className="font-medium">{(bo as any)?.account_receivable_COA || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Name</p>
                    <p className="font-medium">{(bo as any)?.payment_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment COA</p>
                    <p className="font-medium">{(bo as any)?.payment_COA || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Receivable Amount</p>
                    <p className="font-medium">Rp {formatPriceWithSeparator((bo as any)?.account_receivable_amount || 0)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" /> Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>PPN</span>
                    <span className="font-medium">Rp {formatPriceWithSeparator((bo as any)?.ppn || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Paid Amount</span>
                    <span>Rp {formatPriceWithSeparator((bo as any)?.paid_amount || 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingOrderDetail;
