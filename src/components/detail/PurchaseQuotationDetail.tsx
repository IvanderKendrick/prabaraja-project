import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Building2, Calculator, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { usePurchaseQuotationDetail } from "@/hooks/usePurchaseQuotationDetail";

// ✅ Tambahkan import untuk layout
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export function PurchaseQuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quotation, isLoading, error } = usePurchaseQuotationDetail(id);

  const handleGoBack = () => navigate(-1);
  const handleDownloadAttachment = () => {
    if (quotation?.attachment_url) {
      const url = Array.isArray(quotation.attachment_url) ? quotation.attachment_url[0] : quotation.attachment_url.replace(/[\[\]"]/g, "");
      window.open(url, "_blank");
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span>Loading quotation details...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Failed to load quotation</h2>
        <p className="text-gray-500">{error.message}</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  if (!quotation)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Quotation Not Found</h2>
        <p className="text-gray-500">The quotation you are looking for doesn’t exist or was deleted.</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  const isExpired = new Date() > new Date(quotation.valid_until);
  const daysUntilExpiry = Math.ceil((new Date(quotation.valid_until).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const displayNumber = quotation.number ? (quotation.number.toString().startsWith("QUO-") ? quotation.number : `QUO-${quotation.number}`) : "";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ✅ Sidebar kiri */}
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* ✅ Header atas */}
        <Header title={`Purchase Quotation ${displayNumber}`} description="View and manage details of this purchase quotation" />

        {/* ✅ Konten utama */}
        <div className="container mx-auto p-6 space-y-6">
          {/* Header dalam konten */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={handleGoBack} variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Badge className={quotation.status === "Approved" ? "bg-green-100 text-green-800" : quotation.status === "Rejected" ? "bg-red-100 text-red-800" : isExpired ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}>
              {isExpired && quotation.status === "Pending" ? "Expired" : quotation.status}
            </Badge>
          </div>

          {/* Grid utama */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kiri */}
            <div className="space-y-6 lg:col-span-2">
              {/* Quotation info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Quotation Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Quotation Number</Label>
                    <p className="font-medium">{displayNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <p>{quotation.status}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Quotation Date</Label>
                    <p>{new Date(quotation.quotation_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Due Date</Label>
                    <p className={`${isExpired ? "text-red-600 font-semibold" : ""}`}>
                      {new Date(quotation.due_date).toLocaleDateString()}
                      {isExpired && " (Expired)"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Vendor info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Vendor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-start justify-between gap-6 text-sm">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <p className="font-medium">{quotation.vendor_name}</p>
                  </div>
                  {quotation.vendor_address && (
                    <div>
                      <Label className="text-gray-600">Address</Label>
                      <p>{quotation.vendor_address}</p>
                    </div>
                  )}
                  {quotation.vendor_phone && (
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p>{quotation.vendor_phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Items */}
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
                        {quotation.items?.length ? (
                          quotation.items.map((item, i) => {
                            const qty = item.qty || item.quantity || 0;
                            const price = item.price || 0;
                            const discount = item.disc_item_type === "percentage" ? `${item.disc_item}%` : item.disc_item ? formatCurrency(item.disc_item) : "-";
                            const total = qty * price;
                            return (
                              <tr key={i} className="border-b">
                                <td className="py-3 px-3">{item.item_name}</td>
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

              {/* Terms & Notes */}
              {(quotation.terms || quotation.memo) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {quotation.terms && (
                      <div>
                        <Label className="text-gray-600">Terms</Label>
                        <p>{quotation.terms}</p>
                      </div>
                    )}

                    <div>
                      <Label className="text-gray-600">Notes</Label>
                      <p>{quotation.memo || "-"}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar kanan */}
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
                    <span className="font-medium">{formatCurrency(quotation.total)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Grand Total</span>
                    <span>{formatCurrency(quotation.grand_total)}</span>
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
                    <span className={`${isExpired ? "text-red-600 font-semibold" : ""}`}>{new Date(quotation.valid_until).toLocaleDateString()}</span>
                  </div>
                  {!isExpired && (
                    <div className="flex justify-between">
                      <span>Days Remaining</span>
                      <span className={`${daysUntilExpiry <= 7 ? "text-orange-600" : "text-green-600"}`}>{daysUntilExpiry} days</span>
                    </div>
                  )}
                  {isExpired && <p className="text-red-700 bg-red-50 border border-red-200 rounded-md p-2">This quotation has expired.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
