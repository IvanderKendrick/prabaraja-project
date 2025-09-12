import { useParams, Link, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, FileText } from "lucide-react";
import { useSalesInvoiceById } from "@/hooks/useSalesDetail";
import { formatCurrency } from "@/lib/utils";

const SalesInvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoice, isLoading, error } = useSalesInvoiceById(id || "");

  // Function to handle the back button click
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
            <div className="text-lg">Loading sales invoice...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <Button variant="outline" size="sm" className="mb-6" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Card>
            <CardContent className="p-6">
              <p className="text-center py-8">Sales Invoice not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate payment status
  const isPaid = invoice.status === "Paid";
  const isOverdue = !isPaid && new Date() > new Date(invoice.due_date);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white mr-4" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-white flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                INV-{invoice.number}
              </h1>
              <p className="text-white/80 text-sm">Sales Invoice from {new Date(invoice.invoice_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Invoice Details</h2>
              <p className="text-gray-500">View and manage sales invoice information</p>
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
                  <span>Invoice Summary</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${isPaid ? "bg-green-100 text-green-800" : isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{invoice.status}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Invoice Number</p>
                    <p className="font-medium">INV-{invoice.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invoice Date</p>
                    <p className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-sm inline-block mt-1 ${invoice.status === "Paid" ? "bg-green-100 text-green-800" : isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {invoice.status}
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
                    {invoice.customer_id ? (
                      <Link to={`/contact-details/${invoice.customer_id}`} className="font-medium text-primary hover:underline">
                        {invoice.customer_name}
                      </Link>
                    ) : (
                      <p className="font-medium">{invoice.customer_name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
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
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item: any, index: number) => (
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
                            No items in this invoice
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-2 border-t pt-4">
                  {/* Enhanced Tax Calculation Details */}
                  {invoice.tax_details && (
                    <Card className="mb-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Tax Calculation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">DPP/VOT:</span>
                            <span className="font-medium">{formatCurrency(invoice.tax_details.dpp)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">PPN (VAT):</span>
                            <span className="font-medium">{formatCurrency(invoice.tax_details.ppn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">PPh:</span>
                            <span className="font-medium">{formatCurrency(invoice.tax_details.pph)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-between font-bold text-lg">
                    <span>Grand Total</span>
                    <span>{formatCurrency(invoice.grand_total)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Balance Due</span>
                    <span className={isPaid ? "text-green-600" : ""}>{isPaid ? formatCurrency(0) : formatCurrency(invoice.grand_total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className={`font-medium ${isPaid ? "text-green-600" : isOverdue ? "text-red-600" : ""}`}>{isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-lg">{formatCurrency(invoice.grand_total)}</p>
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

export default SalesInvoiceDetail;
