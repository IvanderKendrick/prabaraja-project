import { useParams, Link, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, FileText, Clock } from "lucide-react";
import { useQuotationById } from "@/hooks/useSalesDetail";
import { formatCurrency } from "@/lib/utils";

const QuotationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: quotation, isLoading, error } = useQuotationById(id || "");

  const handleGoBack = () => {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
      navigate(-1);
    } else {
      navigate("/sales");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading quotation...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <Button variant="outline" size="sm" className="mb-6" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Card>
            <CardContent className="p-6">
              <p className="text-center py-8">Quotation not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(quotation.valid_until);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white mr-4" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-white flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                QUO-{quotation.number}
              </h1>
              <p className="text-white/80 text-sm">Quotation from {new Date(quotation.quotation_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Quotation Details</h2>
              <p className="text-gray-500">View and manage quotation information</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Quotation Summary</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${isExpired ? "bg-red-100 text-red-800" : quotation.status === "Accepted" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {isExpired ? "Expired" : quotation.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quotation Number</p>
                    <p className="font-medium">QUO-{quotation.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quotation Date</p>
                    <p className="font-medium">{new Date(quotation.quotation_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valid Until</p>
                    <p className={`font-medium ${isExpired ? "text-red-600" : ""}`}>{new Date(quotation.valid_until).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-sm inline-block mt-1 ${isExpired ? "bg-red-100 text-red-800" : quotation.status === "Accepted" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {isExpired ? "Expired" : quotation.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    {quotation.customer_id ? (
                      <Link to={`/contact-details/${quotation.customer_id}`} className="font-medium text-primary hover:underline">
                        {quotation.customer_name}
                      </Link>
                    ) : (
                      <p className="font-medium">{quotation.customer_name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quotation Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Item</th>
                        <th className="text-right py-3 px-4">Quantity</th>
                        <th className="text-right py-3 px-4">Unit Price</th>
                        <th className="text-right py-3 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotation.items && quotation.items.length > 0 ? (
                        quotation.items.map((item: any, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">{item.name || item.description}</td>
                            <td className="text-right py-3 px-4">{item.quantity}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(item.price || item.unit_price)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency((item.price || item.unit_price) * item.quantity)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500">
                            No items in this quotation
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-2 border-t pt-4">
                  {/* Enhanced Tax Calculation Details */}
                  {quotation.tax_details && (
                    <Card className="mb-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Tax Calculation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">DPP/VOT:</span>
                            <span className="font-medium">{formatCurrency(quotation.tax_details.dpp)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">PPN (VAT):</span>
                            <span className="font-medium">{formatCurrency(quotation.tax_details.ppn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">PPh:</span>
                            <span className="font-medium">{formatCurrency(quotation.tax_details.pph)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(quotation.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {quotation.terms && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{quotation.terms}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Validity Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Valid Until</p>
                    <p className={`font-medium ${isExpired ? "text-red-600" : "text-green-600"}`}>
                      {new Date(quotation.valid_until).toLocaleDateString()}
                      {isExpired ? " (Expired)" : " (Valid)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Days Remaining</p>
                    <p className={`font-medium ${isExpired ? "text-red-600" : ""}`}>{isExpired ? "Expired" : `${Math.max(0, Math.ceil((new Date(quotation.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days`}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetail;
