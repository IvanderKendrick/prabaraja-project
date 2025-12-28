import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Package, DollarSign, AlertCircle, Truck, Loader2, FileText, Building2, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useSalesShipmentDetail } from "@/hooks/useSalesShipmentDetail";

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: shipment, isLoading, error } = useSalesShipmentDetail(id || "");

  const isExpired = shipment ? new Date() > new Date(shipment.due_date || shipment.shipping_date || new Date()) : false;
  const daysUntilExpiry = shipment ? Math.ceil((new Date(shipment.due_date || shipment.shipping_date || new Date()).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  const displayNumber = shipment?.number ? (shipment.number.toString().startsWith("SH-") ? shipment.number : `SH-${shipment.number}`) : "";

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span>Loading shipment details...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Failed to load shipment</h2>
        <p className="text-gray-500">{(error as Error).message}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title={`Sales Shipment ${displayNumber}`} description="View and manage details of this sales shipment" />

        <div className="container mx-auto p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Badge className={shipment.status === "Delivered" ? "bg-green-100 text-green-800" : shipment.status === "Cancelled" ? "bg-red-100 text-red-800" : isExpired ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}>
              {isExpired && shipment.status === "Pending" ? "Expired" : shipment.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Shipment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Shipment Number</Label>
                    <p className="font-medium">{displayNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <p>{shipment.status}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Shipment Date</Label>
                    <p>{new Date(shipment.date || shipment.shipping_date || new Date()).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Due Date</Label>
                    <p className={`${isExpired ? "text-red-600 font-semibold" : ""}`}>
                      {new Date(shipment.due_date || new Date()).toLocaleDateString()}
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
                    <p className="font-medium">{(shipment as any).customer_name || (shipment as any).vendor_name}</p>
                  </div>
                  {(shipment as any).customer_address || (shipment as any).vendor_address ? (
                    <div>
                      <Label className="text-gray-600">Address</Label>
                      <p>{(shipment as any).customer_address || (shipment as any).vendor_address}</p>
                    </div>
                  ) : null}
                  {(shipment as any).customer_phone || (shipment as any).vendor_phone ? (
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p>{(shipment as any).customer_phone || (shipment as any).vendor_phone}</p>
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
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Return</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(shipment as any).items?.length ? (
                          (shipment as any).items.map((item: any, i: number) => {
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
                                <td className="py-3 px-3 text-right">{item.return_unit ?? item.return_item ?? item.return_qty ?? 0}</td>
                                <td className="py-3 px-3 text-right font-medium">{formatCurrency(total)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-gray-500">
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency((shipment as any).total || 0)}</span>
                  </div>
                  {(shipment as any).dpp || (shipment as any).tax_details?.dpp ? (
                    <div className="flex justify-between">
                      <span>DPP</span>
                      <span>{formatCurrency((shipment as any).dpp || (shipment as any).tax_details?.dpp || 0)}</span>
                    </div>
                  ) : null}
                  {(shipment as any).ppn || (shipment as any).tax_details?.ppn ? (
                    <div className="flex justify-between">
                      <span>PPN</span>
                      <span>{formatCurrency((shipment as any).ppn || (shipment as any).tax_details?.ppn || 0)}</span>
                    </div>
                  ) : null}
                  {(shipment as any).pph || (shipment as any).tax_details?.pph ? (
                    <div className="flex justify-between">
                      <span>PPH</span>
                      <span>{formatCurrency((shipment as any).pph || (shipment as any).tax_details?.pph || 0)}</span>
                    </div>
                  ) : null}
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Grand Total</span>
                    <span>{formatCurrency((shipment as any).grand_total || (shipment as any).total || 0)}</span>
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
                    <span>Carrier</span>
                    <span>{(shipment as any).carrier || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tracking Number</span>
                    <span>{(shipment as any).tracking_number || "-"}</span>
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

export default ShipmentDetail;
