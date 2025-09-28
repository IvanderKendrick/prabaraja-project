import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, FileText, User, Building2, Calculator, Package, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { usePurchaseQuotationDetail } from "@/hooks/usePurchaseQuotationDetail";

interface QuotationItem {
  item_name: string;
  qty: number;
  price: number;
  discount?: number;
}

interface TaxDetails {
  dpp?: number;
  ppn?: number;
  pph?: number;
  grandTotal?: number;
}

interface PurchaseQuotationData {
  id: string;
  number: string;
  quotation_date: string;
  valid_until: string;
  vendor_name: string;
  vendor_address?: string;
  vendor_phone?: string;
  status: string;
  items: QuotationItem[];
  terms?: string;
  memo?: string;
  tax_details?: TaxDetails;
  total: number;
  grand_total: number;
  attachment_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function PurchaseQuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    data: quotation, 
    isLoading, 
    error 
  } = usePurchaseQuotationDetail(id);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDownloadAttachment = () => {
    if (quotation?.attachment_url) {
      // Open attachment in new tab
      window.open(quotation.attachment_url, '_blank');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500">Loading quotation details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Quotation</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Data not found
  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data not found</h2>
            <p className="text-gray-600 mb-4">The quotation you're looking for doesn't exist.</p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(quotation.valid_until);
  const daysUntilExpiry = Math.ceil((new Date(quotation.valid_until).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button onClick={handleGoBack} variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchases
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Purchase Quotation {quotation.number}</h1>
              <p className="text-gray-600 mt-1">View quotation details and specifications</p>
            </div>
            <Badge 
              className={
                quotation.status === "Approved" ? "bg-green-100 text-green-800" :
                quotation.status === "Rejected" ? "bg-red-100 text-red-800" :
                quotation.status === "Expired" || isExpired ? "bg-gray-100 text-gray-800" :
                "bg-yellow-100 text-yellow-800"
              }
            >
              {isExpired && quotation.status === "Pending" ? "Expired" : quotation.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quotation Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quotation Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Quotation Number</Label>
                    <p className="text-sm font-semibold">{quotation.number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge 
                      className={
                        quotation.status === "Approved" ? "bg-green-100 text-green-800" :
                        quotation.status === "Rejected" ? "bg-red-100 text-red-800" :
                        quotation.status === "Expired" || isExpired ? "bg-gray-100 text-gray-800" :
                        "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {isExpired && quotation.status === "Pending" ? "Expired" : quotation.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Quotation Date</Label>
                    <p className="text-sm">{new Date(quotation.quotation_date).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Valid Until</Label>
                    <p className={`text-sm ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                      {new Date(quotation.valid_until).toLocaleDateString('en-GB')}
                      {isExpired && <span className="ml-2">(Expired)</span>}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Vendor Name</Label>
                  <p className="text-sm font-semibold">{quotation.vendor_name}</p>
                </div>
                {quotation.vendor_address && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-sm">{quotation.vendor_address}</p>
                  </div>
                )}
                {quotation.vendor_phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-sm">{quotation.vendor_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Quotation Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-600">Item</th>
                        <th className="text-right py-2 font-medium text-gray-600">Qty</th>
                        <th className="text-right py-2 font-medium text-gray-600">Price</th>
                        <th className="text-right py-2 font-medium text-gray-600">Discount</th>
                        <th className="text-right py-2 font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotation.items && quotation.items.length > 0 ? (
                        quotation.items.map((item: any, index) => {
                          // Handle different field names for items
                          const itemName = item.item_name || item.name || item.description || 'Unknown Item';
                          const quantity = item.qty || item.quantity || item.qty_per_unit || 0;
                          const price = item.price || item.unit_price || item.price_per_unit || 0;
                          const discount = item.discount || 0;
                          
                          const itemTotal = quantity * price;
                          const discountAmount = itemTotal * discount / 100;
                          const finalTotal = itemTotal - discountAmount;
                          
                          return (
                            <tr key={index} className="border-b">
                              <td className="py-3 font-medium">{itemName}</td>
                              <td className="text-right py-3">{quantity}</td>
                              <td className="text-right py-3">{formatCurrency(price)}</td>
                              <td className="text-right py-3">{discount}%</td>
                              <td className="text-right py-3 font-semibold">{formatCurrency(finalTotal)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-500">
                            No items in this quotation
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            {(quotation.terms || quotation.memo) && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quotation.terms && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Terms</Label>
                      <p className="text-sm text-gray-700 mt-1">{quotation.terms}</p>
                    </div>
                  )}
                  {quotation.memo && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Memo</Label>
                      <p className="text-sm text-gray-700 mt-1">{quotation.memo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Attachment */}
            {quotation.attachment_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Attachment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadAttachment}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Attachment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quotation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Quotation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium">{formatCurrency(quotation.total)}</span>
                </div>
                {quotation.tax_details && typeof quotation.tax_details === 'object' && (
                  <>
                    {(quotation.tax_details as TaxDetails).dpp && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">DPP</span>
                        <span className="text-sm font-medium">{formatCurrency((quotation.tax_details as TaxDetails).dpp!)}</span>
                      </div>
                    )}
                    {(quotation.tax_details as TaxDetails).ppn && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">PPN</span>
                        <span className="text-sm font-medium">{formatCurrency((quotation.tax_details as TaxDetails).ppn!)}</span>
                      </div>
                    )}
                    {(quotation.tax_details as TaxDetails).pph && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">PPH</span>
                        <span className="text-sm font-medium">{formatCurrency((quotation.tax_details as TaxDetails).pph!)}</span>
                      </div>
                    )}
                  </>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-semibold text-lg">{formatCurrency(quotation.grand_total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Validity Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Validity Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valid Until</span>
                    <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : ''}`}>
                      {new Date(quotation.valid_until).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  {!isExpired && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days Remaining</span>
                      <span className={`text-sm font-medium ${daysUntilExpiry <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                        {daysUntilExpiry} days
                      </span>
                    </div>
                  )}
                  {isExpired && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700 font-medium">This quotation has expired</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}