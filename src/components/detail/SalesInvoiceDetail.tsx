import { useParams } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Building2, Calculator, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useSalesInvoiceDetail } from "@/hooks/useSalesInvoiceDetail";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const SalesInvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading, error } = useSalesInvoiceDetail(id);

  const handleGoBack = () => window.history.back();

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span>Loading invoice details...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Failed to load invoice</h2>
        <p className="text-gray-500">{(error as Error).message}</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  if (!invoice)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Invoice Not Found</h2>
        <p className="text-gray-500">The invoice you are looking for doesn’t exist or was deleted.</p>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );

  const isPaid = invoice.status === "Paid" || invoice.status === "Completed";
  const isOverdue = !isPaid && invoice.due_date ? new Date() > new Date(invoice.due_date) : false;

  const isExpired = isOverdue;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header title={`Sales Invoice INV-${invoice.number}`} description="View and manage this sales invoice" />

        <div className="container mx-auto p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={handleGoBack} variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Badge className={isPaid ? "bg-green-100 text-green-800" : isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>{isPaid ? "Paid" : isOverdue ? "Overdue" : invoice.status}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Invoice Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Invoice Number</Label>
                    <p className="font-medium">INV-{invoice.number}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <p>{invoice.status}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Invoice Date</Label>
                    <p>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Due Date</Label>
                    <p className={`${isExpired ? "text-red-600 font-semibold" : ""}`}>
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "-"}
                      {isExpired && " (Overdue)"}
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
                    <p className="font-medium">{invoice.customer_name}</p>
                  </div>
                  {invoice.customer_address && (
                    <div>
                      <Label className="text-gray-600">Address</Label>
                      <p>{invoice.customer_address}</p>
                    </div>
                  )}
                  {invoice.customer_phone && (
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p>{invoice.customer_phone}</p>
                    </div>
                  )}
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
                          <th className="text-right py-2 px-3 font-medium text-gray-600">COA</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Price</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Discount</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Return</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items?.length ? (
                          invoice.items.map((item: any, i: number) => {
                            const qty = item.qty || item.quantity || 0;
                            const price = item.price || item.unit_price || 0;
                            const discount = item.disc_item_type === "percentage" ? `${item.disc_item}%` : item.disc_item ? formatCurrency(item.disc_item) : "-";
                            const total = qty * price;
                            return (
                              <tr key={i} className="border-b">
                                <td className="py-3 px-3">{item.item_name || item.product_name || item.name || item.description}</td>
                                <td className="py-3 px-3 text-right">{qty}</td>
                                <td className="py-3 px-3 text-right">
                                  {(() => {
                                    const raw = item.coa || item.item_coa_label || "";
                                    if (!raw) return "-";
                                    const str = String(raw);
                                    // if label like "140101-1-3 - Prepaid Purchases-Vendor A", take prefix before ' - '
                                    if (str.includes(" - ")) return str.split(" - ")[0].trim();
                                    // otherwise take first token
                                    return str.split(/\s+/)[0].trim();
                                  })()}
                                </td>
                                <td className="py-3 px-3 text-right">{formatCurrency(price)}</td>
                                <td className="py-3 px-3 text-right">{discount}</td>
                                <td className="py-3 px-3 text-right">{item.return_unit ?? 0}</td>
                                <td className="py-3 px-3 text-right font-medium">{formatCurrency(total)}</td>
                              </tr>
                            );
                          })
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

                  {/* removed Grand Total & Balance Due from Items section per request */}
                </CardContent>
              </Card>

              {(invoice.terms || invoice.memo) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {invoice.terms && (
                      <div>
                        <Label className="text-gray-600">Terms</Label>
                        <p>{invoice.terms}</p>
                      </div>
                    )}
                    {invoice.memo && (
                      <div>
                        <Label className="text-gray-600">Memo</Label>
                        <p>{invoice.memo}</p>
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
                    <span className="font-medium">{formatCurrency((invoice as any).total || 0)}</span>
                  </div>
                  {(invoice as any).freight_out ? (
                    <div className="flex justify-between">
                      <span>Freight Out</span>
                      <span>{formatCurrency((invoice as any).freight_out || 0)}</span>
                    </div>
                  ) : null}
                  {(invoice as any).insurance ? (
                    <div className="flex justify-between">
                      <span>Insurance</span>
                      <span>{formatCurrency((invoice as any).insurance || 0)}</span>
                    </div>
                  ) : null}
                  {(invoice as any).dpp || (invoice as any).tax_details?.dpp ? (
                    <div className="flex justify-between">
                      <span>DPP</span>
                      <span>{formatCurrency((invoice as any).dpp || (invoice as any).tax_details?.dpp || 0)}</span>
                    </div>
                  ) : null}
                  {(invoice as any).ppn || (invoice as any).tax_details?.ppn ? (
                    <div className="flex justify-between">
                      <span>PPN</span>
                      <span>{formatCurrency((invoice as any).ppn || (invoice as any).tax_details?.ppn || 0)}</span>
                    </div>
                  ) : null}
                  {(invoice as any).pph || (invoice as any).tax_details?.pph ? (
                    <div className="flex justify-between">
                      <span>PPH</span>
                      <span>{formatCurrency((invoice as any).pph || (invoice as any).tax_details?.pph || 0)}</span>
                    </div>
                  ) : null}
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Grand Total</span>
                    <span>{formatCurrency(invoice.grand_total || (invoice as any).total || 0)}</span>
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
                  <div>
                    <Label className="text-gray-600">Customer COA</Label>
                    <p className="break-words font-medium">{invoice.customer_COA || "-"}</p>
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

export default SalesInvoiceDetail;
