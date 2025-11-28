import { useParams, useNavigate } from "react-router-dom";

// Tambahan
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

import {
  ArrowLeft,
  Calendar,
  FileText,
  Building2,
  Calculator,
  Package,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { usePurchaseRequestDetail } from "@/hooks/usePurchaseRequestDetail";

export function PurchaseRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: request, isLoading, error } = usePurchaseRequestDetail(id);

  const handleGoBack = () => navigate(-1);
  const handleDownloadAttachment = () => {
    if (request?.attachment_url) {
      const url = Array.isArray(request.attachment_url)
        ? request.attachment_url[0]
        : request.attachment_url.replace(/[\[\]"]/g, "");
      window.open(url, "_blank");
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span>Loading request details...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Failed to load request
        </h2>
        <p className="text-gray-500">{error.message}</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  if (!request)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Request Not Found
        </h2>
        <p className="text-gray-500">
          The request you are looking for doesn’t exist or was deleted.
        </p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  const isExpired = new Date() > new Date(request.due_date);
  const daysUntilExpiry = Math.ceil(
    (new Date(request.due_date).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24)
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title={`Purchase Request ${request.number}`}
          description="View and manage details of this purchase request"
        />

        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Badge
              className={
                request.status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : request.status === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : isExpired
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              {isExpired && request.status === "Pending"
                ? "Expired"
                : request.status}
            </Badge>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Request info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Request Number</Label>
                    <p className="font-medium">{request.number}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <p>{request.status}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Request Date</Label>
                    <p>{new Date(request.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Due Date</Label>
                    <p>{new Date(request.due_date).toLocaleDateString()}</p>
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
                    <Label className="text-gray-600">Vendor Name</Label>
                    <p className="font-medium">{request.vendor_name}</p>
                  </div>
                  {request.vendor_address && (
                    <div>
                      <Label className="text-gray-600">Vendor Address</Label>
                      <p>{request.vendor_address}</p>
                    </div>
                  )}
                  {request.vendor_phone && (
                    <div>
                      <Label className="text-gray-600">Vendor Phone</Label>
                      <p>{request.vendor_phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" /> Requested Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">
                            Item
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">
                            Qty
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">
                            Price
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">
                            Discount
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {request.items?.length ? (
                          request.items.map((item, i) => {
                            const qty = item.qty || item.quantity || 0;
                            const price = item.price || 0;
                            const discount =
                              item.disc_item_type === "percentage"
                                ? `${item.disc_item}%`
                                : item.disc_item
                                ? formatCurrency(item.disc_item)
                                : "-";
                            const total = qty * price;
                            return (
                              <tr key={i} className="border-b">
                                <td className="py-3 px-3">{item.item_name}</td>
                                <td className="py-3 px-3 text-right">{qty}</td>
                                <td className="py-3 px-3 text-right">
                                  {formatCurrency(price)}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {discount}
                                </td>
                                <td className="py-3 px-3 text-right font-medium">
                                  {formatCurrency(total)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-4 text-gray-500"
                            >
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Memo */}
              {(request.terms || request.memo) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {request.terms && (
                      <div>
                        <Label className="text-gray-600">Terms</Label>
                        <p>{request.terms}</p>
                      </div>
                    )}
                    {request.memo && (
                      <div>
                        <Label className="text-gray-600">Memo</Label>
                        <p>{request.memo}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right sidebar */}
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
                    <span className="font-medium">
                      {formatCurrency(request.total)}
                    </span>
                  </div>
                  {request && (
                    <>
                      {request.dpp && (
                        <div className="flex justify-between">
                          <span>DPP</span>
                          <span>{formatCurrency(request.dpp || 0)}</span>
                        </div>
                      )}
                      {request.ppn && (
                        <div className="flex justify-between">
                          <span>PPN</span>
                          <span>{formatCurrency(request.ppn || 0)}</span>
                        </div>
                      )}
                      {request && (
                        <div className="flex justify-between">
                          <span>PPH</span>
                          <span>{formatCurrency(request.pph || 0)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Grand Total</span>
                    <span>{formatCurrency(request.grand_total)}</span>
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
                    <span>Requested By</span>
                    <span>{request.requested_by || "N/A"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Urgency</span>
                    <span>{request.urgency || "Normal"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
