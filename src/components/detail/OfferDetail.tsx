import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Package, DollarSign, AlertCircle, Tag, Loader2, FileText, Building2, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSalesOfferDetail } from "@/hooks/useSalesOfferDetail";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface OfferItem {
  id: string;
  name: string;
  quantity: number;
  unit_price?: number;
  price?: number;
  total?: number;
}

interface Offer {
  id: string;
  user_id: string;
  number: number;
  date: string;
  expiry_date?: string;
  due_date: string;
  status: string;
  discount_terms?: string;
  items: OfferItem[];
  grand_total: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

const OfferDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: offer, isLoading, error } = useSalesOfferDetail(id);

  const isExpired = offer ? new Date() > new Date(offer.expiry_date || offer.due_date || new Date()) : false;
  const daysUntilExpiry = offer ? Math.ceil((new Date(offer.expiry_date || offer.due_date || new Date()).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  const displayNumber = offer?.number ? (offer.number.toString().startsWith("OFR-") ? offer.number : `OFR-${offer.number}`) : "";

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span>Loading offer details...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Failed to load offer</h2>
        <p className="text-gray-500">{(error as Error).message}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  if (!offer)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Offer Not Found</h2>
        <p className="text-gray-500">The offer you are looking for doesn’t exist or was deleted.</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title={`Sales Offer ${displayNumber}`} description="View and manage details of this sales offer" />
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Badge className={offer.status === "Approved" ? "bg-green-100 text-green-800" : offer.status === "Rejected" ? "bg-red-100 text-red-800" : isExpired ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}>
              {isExpired && offer.status === "Pending" ? "Expired" : offer.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Offer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Offer Number</Label>
                    <p className="font-medium">{displayNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <p>{offer.status}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Start Date</Label>
                    <p>{new Date(offer.date || offer.offer_date || new Date()).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Due Date</Label>
                    <p className={`${isExpired ? "text-red-600 font-semibold" : ""}`}>
                      {new Date(offer.due_date || offer.expiry_date || new Date()).toLocaleDateString()}
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
                    <p className="font-medium">{offer.customer_name || offer.vendor_name}</p>
                  </div>
                  {offer.customer_address || offer.vendor_address ? (
                    <div>
                      <Label className="text-gray-600">Address</Label>
                      <p>{offer.customer_address || offer.vendor_address}</p>
                    </div>
                  ) : null}
                  {offer.customer_phone || offer.vendor_phone ? (
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p>{offer.customer_phone || offer.vendor_phone}</p>
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
                        {offer.items?.length ? (
                          offer.items.map((item: any, i: number) => {
                            const qty = item.qty || item.quantity || 0;
                            const price = item.price || item.unit_price || 0;
                            const discount = item.disc_item_type === "percentage" ? `${item.disc_item}%` : item.disc_item ? formatCurrency(item.disc_item) : "-";
                            const total = qty * price;
                            return (
                              <tr key={i} className="border-b">
                                <td className="py-3 px-3">{item.product_name || item.item_name || item.name || item.description}</td>
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

              {(offer.terms || offer.memo) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {offer.terms && (
                      <div>
                        <Label className="text-gray-600">Terms</Label>
                        <p>{offer.terms}</p>
                      </div>
                    )}
                    {offer.memo && (
                      <div>
                        <Label className="text-gray-600">Memo</Label>
                        <p>{offer.memo}</p>
                      </div>
                    )}
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
                    <span className="font-medium">{formatCurrency(offer.total || 0)}</span>
                  </div>
                  {offer.tax_details && (
                    <>
                      {offer.tax_details.dpp && (
                        <div className="flex justify-between">
                          <span>DPP</span>
                          <span>{formatCurrency(offer.tax_details.dpp || 0)}</span>
                        </div>
                      )}
                      {offer.tax_details.ppn && (
                        <div className="flex justify-between">
                          <span>PPN</span>
                          <span>{formatCurrency(offer.tax_details.ppn || 0)}</span>
                        </div>
                      )}
                      {offer.tax_details.pph && (
                        <div className="flex justify-between">
                          <span>PPH</span>
                          <span>{formatCurrency(offer.tax_details.pph || 0)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Grand Total</span>
                    <span>{formatCurrency(offer.grand_total || offer.total || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Validity
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Valid Until</span>
                    <span className={`${isExpired ? "text-red-600 font-semibold" : ""}`}>{new Date(offer.expiry_date || offer.due_date || new Date()).toLocaleDateString()}</span>
                  </div>
                  {!isExpired && (
                    <div className="flex justify-between">
                      <span>Days Remaining</span>
                      <span className={`${daysUntilExpiry <= 7 ? "text-orange-600" : "text-green-600"}`}>{daysUntilExpiry} days</span>
                    </div>
                  )}
                  {isExpired && <p className="text-red-700 bg-red-50 border border-red-200 rounded-md p-2">This offer has expired.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;
