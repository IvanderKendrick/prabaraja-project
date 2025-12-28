import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";

interface SalesStatsCardsProps {
  unpaidAmount: number;
  last30DaysReceived: number;
}

export function SalesStatsCards({ unpaidAmount, last30DaysReceived }: SalesStatsCardsProps) {
  const formatCurrency = (val: number) => val.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Unpaid Invoices Card */}
      <Card className="backdrop-blur-sm bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Unpaid Invoices</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-medium text-orange-600">{formatCurrency(unpaidAmount)}</div>
            <p className="text-xs text-muted-foreground">Total tagihan invoice yang belum dibayar</p>
          </div>
        </CardContent>
      </Card>
      {/* Last 30 Days Received Card */}
      <Card className="backdrop-blur-sm bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Last 30 Days Received</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-medium text-green-600">{formatCurrency(last30DaysReceived)}</div>
            <p className="text-xs text-muted-foreground">Total pembayaran yang diterima 30 hari terakhir</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
