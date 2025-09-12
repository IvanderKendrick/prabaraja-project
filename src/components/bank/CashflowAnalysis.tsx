
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

interface Account {
  code: string;
  name: string;
  balance: string;
  bankName?: string;
  accountNumber?: string;
  archived?: boolean;
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "inflow" | "outflow";
  accountCode: string;
  category?: string;
  reference?: string;
}

interface CashflowAnalysisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  transactions: Transaction[];
}

const upcomingTransactions = [
  { 
    id: "inv-001", 
    date: new Date(2024, 3, 15), 
    description: "Client invoice payment", 
    amount: 25000000, 
    type: "inflow" as const,
    status: "pending" 
  },
  { 
    id: "trans-002", 
    date: new Date(2024, 3, 18), 
    description: "Scheduled transfer to vendors", 
    amount: 12500000, 
    type: "outflow" as const,
    status: "scheduled" 
  },
  { 
    id: "bill-003", 
    date: new Date(2024, 3, 20), 
    description: "Office rental payment", 
    amount: 8000000, 
    type: "outflow" as const,
    status: "upcoming" 
  },
];

export function CashflowAnalysis({ open, onOpenChange, accounts, transactions }: CashflowAnalysisProps) {
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  
  const processTransactions = () => {
    // Ensure we have transactions before filtering
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    const filtered = transactions.filter(trans => {
      const isAccountMatch = selectedAccount === "all" || trans.accountCode === selectedAccount;
      
      const today = new Date();
      let startDate = new Date();
      
      if (period === "week") {
        startDate.setDate(today.getDate() - 7);
      } else if (period === "month") {
        startDate.setMonth(today.getMonth() - 1);
      } else if (period === "quarter") {
        startDate.setMonth(today.getMonth() - 3);
      }
      
      const isInTimeRange = trans.date >= startDate && trans.date <= today;
      
      return isAccountMatch && isInTimeRange;
    });
    
    const dailyData: Record<string, { date: string; inflow: number; outflow: number }> = {};
    
    filtered.forEach(trans => {
      const dateStr = trans.date.toISOString().split('T')[0];
      
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, inflow: 0, outflow: 0 };
      }
      
      if (trans.type === "inflow") {
        dailyData[dateStr].inflow += trans.amount;
      } else {
        dailyData[dateStr].outflow += trans.amount;
      }
    });
    
    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  };
  
  const generateBalanceData = () => {
    const cashflowData = processTransactions();
    let runningBalance = 0;
    
    return cashflowData.map(item => {
      runningBalance += (item.inflow - item.outflow);
      return {
        ...item,
        balance: runningBalance
      };
    });
  };
  
  const calculateTotals = () => {
    // Ensure we have transactions before filtering
    if (!transactions || transactions.length === 0) {
      return { inflows: 0, outflows: 0, netCashflow: 0 };
    }
    
    const filtered = transactions.filter(trans => {
      const isAccountMatch = selectedAccount === "all" || trans.accountCode === selectedAccount;
      
      const today = new Date();
      let startDate = new Date();
      
      if (period === "week") {
        startDate.setDate(today.getDate() - 7);
      } else if (period === "month") {
        startDate.setMonth(today.getMonth() - 1);
      } else if (period === "quarter") {
        startDate.setMonth(today.getMonth() - 3);
      }
      
      const isInTimeRange = trans.date >= startDate && trans.date <= today;
      
      return isAccountMatch && isInTimeRange;
    });
    
    const inflows = filtered
      .filter(t => t.type === "inflow")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const outflows = filtered
      .filter(t => t.type === "outflow")
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      inflows,
      outflows,
      netCashflow: inflows - outflows
    };
  };
  
  const cashflowData = processTransactions();
  const balanceData = generateBalanceData();
  const totals = calculateTotals();
  
  const handleExport = () => {
    toast.info("Exporting report as PDF...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex justify-between items-center">
            <span>Cashflow Analysis</span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#F3F4F6]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Inflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.inflows)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                During selected {period} period
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#F3F4F6]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Outflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.outflows)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                During selected {period} period
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#F3F4F6]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.netCashflow)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                During selected {period} period
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select 
                    value={period} 
                    onValueChange={(value) => setPeriod(value as "week" | "month" | "quarter")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="quarter">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account</label>
                  <Select 
                    value={selectedAccount} 
                    onValueChange={setSelectedAccount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      {accounts && accounts.filter(a => !a.archived).map(account => (
                        <SelectItem key={account.code} value={account.code}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="cashflow">
              <TabsList>
                <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                <TabsTrigger value="balance">Running Balance</TabsTrigger>
                <TabsTrigger value="comparison">Income vs. Expenses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cashflow" className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cashflowData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent>
                              <div className="font-medium">{new Date(label).toLocaleDateString()}</div>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center">
                                  <div className="h-2 w-2 rounded-full bg-[#4ade80] mr-1" />
                                  <span className="font-medium">Inflow:</span>
                                  <span className="ml-1">{formatCurrency(payload[0].value as number)}</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="h-2 w-2 rounded-full bg-[#f87171] mr-1" />
                                  <span className="font-medium">Outflow:</span>
                                  <span className="ml-1">{formatCurrency(payload[1].value as number)}</span>
                                </div>
                              </div>
                            </ChartTooltipContent>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inflow" 
                      stackId="1"
                      stroke="#4ade80" 
                      fill="#4ade80" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="outflow" 
                      stackId="2"
                      stroke="#f87171" 
                      fill="#f87171" 
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="balance" className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={balanceData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent>
                              <div className="font-medium">{new Date(label).toLocaleDateString()}</div>
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-[#8B5CF6] mr-1" />
                                <span className="font-medium">Balance:</span>
                                <span className="ml-1">{formatCurrency(payload[0].value as number)}</span>
                              </div>
                            </ChartTooltipContent>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="comparison" className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cashflowData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent>
                              <div className="font-medium">{new Date(label).toLocaleDateString()}</div>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center">
                                  <div className="h-2 w-2 rounded-full bg-[#4ade80] mr-1" />
                                  <span className="font-medium">Income:</span>
                                  <span className="ml-1">{formatCurrency(payload[0].value as number)}</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="h-2 w-2 rounded-full bg-[#f87171] mr-1" />
                                  <span className="font-medium">Expenses:</span>
                                  <span className="ml-1">{formatCurrency(payload[1].value as number)}</span>
                                </div>
                              </div>
                            </ChartTooltipContent>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="inflow" 
                      name="Income" 
                      fill="#4ade80" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="outflow" 
                      name="Expenses" 
                      fill="#f87171" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
