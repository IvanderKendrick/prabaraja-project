
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useInvoiceById } from "@/hooks/useInvoice";
import { InvoiceHeader } from "@/components/invoice/InvoiceHeader";
import { InvoiceSummary } from "@/components/invoice/InvoiceSummary";
import { VendorInformation } from "@/components/invoice/VendorInformation";
import { InvoiceItems } from "@/components/invoice/InvoiceItems";
import { PaymentInformation } from "@/components/invoice/PaymentInformation";
import { AdditionalInformation } from "@/components/invoice/AdditionalInformation";

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: invoice, isLoading, error } = useInvoiceById(id || "");

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading invoice...</div>
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
          <div className="bg-white rounded-md shadow p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-gray-500">The invoice you're looking for doesn't exist or may have been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform the invoice data for display
  const invoiceDisplay = {
    id: invoice.id,
    number: `INV-${invoice.number}`,
    date: new Date(invoice.date),
    dueDate: invoice.due_date ? new Date(invoice.due_date) : null,
    status: invoice.status,
    approver: invoice.approver || '',
    priority: 'Medium' as const,
    tags: invoice.tags || [],
    items: invoice.items || []
  };

  const isPaid = invoiceDisplay.status === "completed";
  const isOverdue = invoiceDisplay.status === "pending" && invoiceDisplay.dueDate && new Date() > invoiceDisplay.dueDate;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <InvoiceHeader number={invoiceDisplay.number} date={invoiceDisplay.date} />

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <InvoiceSummary 
              number={invoiceDisplay.number}
              date={invoiceDisplay.date}
              dueDate={invoiceDisplay.dueDate}
              status={invoiceDisplay.status}
              isOverdue={isOverdue}
              isPaid={isPaid}
            />

            <VendorInformation />

            <InvoiceItems 
              items={invoiceDisplay.items}
              isPaid={isPaid}
            />

            <PaymentInformation 
              isPaid={isPaid}
              isOverdue={isOverdue}
              date={invoiceDisplay.date}
            />

            <AdditionalInformation 
              approver={invoiceDisplay.approver}
              priority={invoiceDisplay.priority}
              tags={invoiceDisplay.tags}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
