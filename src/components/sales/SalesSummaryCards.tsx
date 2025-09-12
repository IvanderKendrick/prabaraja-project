
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";
import { parseIndonesianCurrency, formatIndonesianCurrency, validateCurrencyAmount } from "@/utils/numberUtils";

interface SalesData {
  id: string;
  date: string;
  number: string;
  customer: string;
  dueDate: string;
  status: string;
  total: string;
}

interface SalesSummaryCardsProps {
  salesData: SalesData[];
}

export const SalesSummaryCards = ({ salesData }: SalesSummaryCardsProps) => {
  console.log('SalesSummaryCards received data:', salesData);
  
  // Define unpaid statuses to include all relevant states
  const unpaidStatuses = ["Unpaid", "Late Payment", "Awaiting Payment"];
  
  // Calculate unpaid invoices total
  const unpaidInvoices = salesData.filter(sale => unpaidStatuses.includes(sale.status));
  console.log('Filtered unpaid invoices:', unpaidInvoices);
  
  const unpaidTotal = unpaidInvoices.reduce((total, sale) => {
    console.log(`Processing sale ${sale.id}: ${sale.total} (status: ${sale.status})`);
    
    const amount = parseIndonesianCurrency(sale.total);
    console.log(`Parsed amount for sale ${sale.id}: ${amount}`);
    
    return total + amount;
  }, 0);
  
  console.log('Total unpaid amount calculated:', unpaidTotal);

  // Calculate paid invoices total
  const paidInvoices = salesData.filter(sale => sale.status === "Paid");
  console.log('Filtered paid invoices:', paidInvoices);
  
  const paidTotal = paidInvoices.reduce((total, sale) => {
    console.log(`Processing paid sale ${sale.id}: ${sale.total}`);
    
    const amount = parseIndonesianCurrency(sale.total);
    console.log(`Parsed paid amount for sale ${sale.id}: ${amount}`);
    
    return total + amount;
  }, 0);
  
  console.log('Total paid amount calculated:', paidTotal);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Unpaid Invoices Card */}
      <Card className="backdrop-blur-sm bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Unpaid Invoices</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-medium text-red-600">{formatIndonesianCurrency(unpaidTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {unpaidInvoices.length} invoices pending payment
            </p>
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Overdue breakdown:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>0-30 days</span>
                  <span className="font-medium">{formatIndonesianCurrency(unpaidTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>31-60 days</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>60+ days</span>
                  <span>$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Received Card */}
      <Card className="backdrop-blur-sm bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Payments Received Last 30 Days</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-medium text-green-600">{formatIndonesianCurrency(paidTotal)}</div>
            <p className="text-xs text-muted-foreground">
              +18.2% from previous month
            </p>
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Payment methods:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Bank Transfer</span>
                  <span className="font-medium">{formatIndonesianCurrency(paidTotal * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Card</span>
                  <span className="font-medium">{formatIndonesianCurrency(paidTotal * 0.3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash</span>
                  <span className="font-medium">{formatIndonesianCurrency(paidTotal * 0.1)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
