import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, FileText, User, Building2, Calculator, Package } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface QuotationItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface PurchaseQuotationData {
  id: string;
  number: string;
  quotationDate: string;
  validUntil: string;
  vendorName: string;
  status: string;
  items: QuotationItem[];
  terms?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

// Mock data for demonstration - in real app, this would come from a hook
const mockQuotations: Record<string, PurchaseQuotationData> = {
  "1": {
    id: "1",
    number: "PQ-001",
    quotationDate: "2024-01-15",
    validUntil: "2024-02-15",
    vendorName: "ABC Supplier Ltd",
    status: "Pending",
    items: [
      { id: "1", name: "Office Supplies", quantity: 10, price: 50000, discount: 5 },
      { id: "2", name: "Computer Equipment", quantity: 2, price: 2500000, discount: 0 }
    ],
    terms: "Payment terms: Net 30 days",
    subtotal: 5500000,
    discountAmount: 25000,
    taxAmount: 547500,
    total: 6022500
  }
};

export function PurchaseQuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Quotation not found</h2>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const quotation = mockQuotations[id];

  if (!quotation) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Quotation not found</h2>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(quotation.validUntil);
  const daysUntilExpiry = Math.ceil((new Date(quotation.validUntil).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

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
                    <p className="text-sm">{new Date(quotation.quotationDate).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Valid Until</Label>
                    <p className={`text-sm ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                      {new Date(quotation.validUntil).toLocaleDateString('en-GB')}
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
              <CardContent>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Vendor Name</Label>
                  <p className="text-sm font-semibold">{quotation.vendorName}</p>
                </div>
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
                      {quotation.items.map((item) => {
                        const itemTotal = item.quantity * item.price;
                        const discountAmount = itemTotal * (item.discount || 0) / 100;
                        const finalTotal = itemTotal - discountAmount;
                        
                        return (
                          <tr key={item.id} className="border-b">
                            <td className="py-3 font-medium">{item.name}</td>
                            <td className="text-right py-3">{item.quantity}</td>
                            <td className="text-right py-3">{formatCurrency(item.price)}</td>
                            <td className="text-right py-3">{item.discount || 0}%</td>
                            <td className="text-right py-3 font-semibold">{formatCurrency(finalTotal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            {quotation.terms && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{quotation.terms}</p>
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
                  <span className="text-sm font-medium">{formatCurrency(quotation.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount</span>
                  <span className="text-sm font-medium text-red-600">-{formatCurrency(quotation.discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="text-sm font-medium">{formatCurrency(quotation.taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg">{formatCurrency(quotation.total)}</span>
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
                      {new Date(quotation.validUntil).toLocaleDateString('en-GB')}
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