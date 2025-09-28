import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  unpaidAmount: number;
  overdueCount: number;
  last30DaysPayments: number;
  pendingApprovalCount?: number;
}

export function StatsCards({ 
  unpaidAmount, 
  overdueCount, 
  last30DaysPayments,
  pendingApprovalCount // Add this to destructured props
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Unpaid Invoices Card */}
      <Card className="backdrop-blur-sm bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Unpaid Invoices</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* <div className="text-2xl font-medium text-orange-600">{formatCurrency(unpaidAmount)}</div> */}
            <div className="text-2xl font-medium text-orange-600">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground">
              Pending & Half-Paid invoices
            </p>
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Status breakdown:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span className="font-medium">{formatCurrency(unpaidAmount * 0.7)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Half-Paid</span>
                  <span className="font-medium">{formatCurrency(unpaidAmount * 0.3)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Awaiting</span>
                  <span className="font-medium">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Invoices Card */}
      <Card className="backdrop-blur-sm bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Overdue Invoices</CardTitle>
          <Clock className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-medium text-red-600">{overdueCount} {overdueCount === 1 ? 'invoice' : 'invoices'}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate action
            </p>
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Priority levels:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>High Priority</span>
                  <span className="font-medium">{overdueCount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Medium Priority</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Low Priority</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last 30 Days Payments Card */}
      <Card className="backdrop-blur-sm bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Last 30 Days Payments</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-medium text-green-600">{formatCurrency(last30DaysPayments)}</div>
            <p className="text-xs text-muted-foreground">
              Total expenses processed
            </p>
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Payment categories:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Supplies</span>
                  <span className="font-medium">{formatCurrency(last30DaysPayments * 0.5)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Services</span>
                  <span className="font-medium">{formatCurrency(last30DaysPayments * 0.3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other</span>
                  <span className="font-medium">{formatCurrency(last30DaysPayments * 0.2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
