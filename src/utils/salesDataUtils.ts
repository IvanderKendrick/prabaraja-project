
import { SalesInvoice, OrderDelivery, Quotation } from '@/hooks/useSalesData';

// Transform sales invoice data to match the SalesTable component format
export const transformSalesInvoiceData = (salesInvoices: SalesInvoice[]) => {
  return salesInvoices.map(invoice => ({
    id: invoice.id,
    date: new Date(invoice.invoice_date).toLocaleDateString('en-GB'),
    number: `INV-${invoice.number}`,
    customer: invoice.customer_name,
    dueDate: new Date(invoice.due_date).toLocaleDateString('en-GB'),
    status: invoice.status,
    total: `Rp ${invoice.grand_total.toLocaleString()}`
  }));
};

// Transform order delivery data to match the SalesTable component format
export const transformOrderDeliveryData = (orders: OrderDelivery[]) => {
  return orders.map(order => ({
    id: order.id,
    date: new Date(order.order_date).toLocaleDateString('en-GB'),
    number: `ORD-${order.number}`,
    customer: order.customer_name,
    dueDate: new Date(order.delivery_date).toLocaleDateString('en-GB'),
    status: order.status,
    total: `Rp ${order.grand_total.toLocaleString()}`
  }));
};

// Transform quotation data to match the SalesTable component format
export const transformQuotationData = (quotations: Quotation[]) => {
  return quotations.map(quotation => ({
    id: quotation.id,
    date: new Date(quotation.quotation_date).toLocaleDateString('en-GB'),
    number: `QUO-${quotation.number}`,
    customer: quotation.customer_name,
    dueDate: new Date(quotation.valid_until).toLocaleDateString('en-GB'),
    status: quotation.status,
    total: `Rp ${quotation.total.toLocaleString()}`
  }));
};
