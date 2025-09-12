
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  isPaid: boolean;
}

export const InvoiceItems = ({ items, isPaid }: InvoiceItemsProps) => {
  // Calculate subtotal and total
  const subtotal = items && items.length > 0
    ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : 0;

  // Add tax (11% for example - different from sales)
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  return (
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
              {items && items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="text-right py-3 px-4">{item.quantity}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(item.price)}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(item.price * item.quantity)}</td>
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
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (11%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span>Balance Due</span>
            <span className={isPaid ? 'text-green-600' : ''}>
              {isPaid ? formatCurrency(0) : formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
