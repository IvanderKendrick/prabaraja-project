import { useParams } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Building2, Calculator, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useSalesOrderDetail } from "@/hooks/useSalesOrderDetail";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useSalesOrderDetail(id);

  const handleGoBack = () => window.history.back();

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span>Loading order details...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Failed to load order</h2>
        <p className="text-gray-500">{(error as Error).message}</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  if (!order)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Order Not Found</h2>
        <p className="text-gray-500">The order you are looking for doesn’t exist or was deleted.</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  const isExpired = order && order.due_date ? new Date() > new Date(order.due_date) : false;
  const daysUntilExpiry = order && order.due_date ? Math.ceil((new Date(order.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  const displayNumber = order?.number ? (order.number.toString().startsWith("ORD-") ? order.number : `ORD-${order.number}`) : "";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title={`Sales Order ${displayNumber}`} description="View and manage details of this sales order" />

        <div className="container mx-auto p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={handleGoBack} variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Badge className={order.status === "Completed" ? "bg-green-100 text-green-800" : order.status === "Cancelled" ? "bg-red-100 text-red-800" : isExpired ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}>
              {isExpired && order.status === "Pending" ? "Expired" : order.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Order Number</Label>
                    <p className="font-medium">{displayNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <p>{order.status}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Order Date</Label>
                    <p>{new Date(order.order_date || order.orders_date || new Date()).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Due Date</Label>
                    <p className={`${isExpired ? "text-red-600 font-semibold" : ""}`}>
                      {new Date(order.due_date || new Date()).toLocaleDateString()}
                      {isExpired && " (Expired)"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-start justify-between gap-6 text-sm">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <p className="font-medium">{(order as any).customer_name || (order as any).vendor_name}</p>
                  </div>
                  {(order as any).customer_address || (order as any).vendor_address ? (
                    <div>
                      <Label className="text-gray-600">Address</Label>
                      <p>{(order as any).customer_address || (order as any).vendor_address}</p>
                    </div>
                  ) : null}
                  {(order as any).customer_phone || (order as any).vendor_phone ? (
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p>{(order as any).customer_phone || (order as any).vendor_phone}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" /> Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Item</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Qty</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Price</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Discount</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order as any).items?.length ? (
                          (order as any).items.map((item: any, i: number) => {
                            const qty = item.qty || item.quantity || 0;
                            const price = item.price || item.unit_price || 0;
                            const discount = item.disc_item_type === "percentage" ? `${item.disc_item}%` : item.disc_item ? formatCurrency(item.disc_item) : "-";
                            const total = qty * price;
                            return (
                              <tr key={i} className="border-b">
                                <td className="py-3 px-3">{item.item_name || item.name || item.description}</td>
                                <td className="py-3 px-3 text-right">{qty}</td>
                                <td className="py-3 px-3 text-right">{formatCurrency(price)}</td>
                                <td className="py-3 px-3 text-right">{discount}</td>
                                <td className="py-3 px-3 text-right font-medium">{formatCurrency(total)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-500">
                              No items found
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
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <Label className="text-gray-600">Memo</Label>
                    <p>{(order as any).memo || "-"}</p>
                  </div>
                </CardContent>
              </Card>

              {order.terms && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <Label className="text-gray-600">Terms</Label>
                      <p>{order.terms}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency((order as any).total || 0)}</span>
                  </div>
                  {order.tax_details && (
                    <>
                      {order.tax_details.dpp && (
                        <div className="flex justify-between">
                          <span>DPP</span>
                          <span>{formatCurrency(order.tax_details.dpp || 0)}</span>
                        </div>
                      )}
                      {order.tax_details.ppn && (
                        <div className="flex justify-between">
                          <span>PPN</span>
                          <span>{formatCurrency(order.tax_details.ppn || 0)}</span>
                        </div>
                      )}
                      {order.tax_details.pph && (
                        <div className="flex justify-between">
                          <span>PPH</span>
                          <span>{formatCurrency(order.tax_details.pph || 0)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Grand Total</span>
                    <span>{formatCurrency(order.grand_total || (order as any).total || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Additional Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Unearned Revenue Amount</span>
                    <span className="font-medium">{(order as any).unearned_revenue_amount ? formatCurrency((order as any).unearned_revenue_amount) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgency</span>
                    <span>{(order as any).level || "-"}</span>
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

export default OrderDetail;
