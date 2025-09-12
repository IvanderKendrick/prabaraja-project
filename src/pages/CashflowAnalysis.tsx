
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, ArrowLeft } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";

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

interface LocationState {
  selectedAccount?: string;
  accounts?: Account[];
  transactions?: Transaction[];
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

const CashflowAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");
  const [selectedAccount, setSelectedAccount] = useState<string>(state?.selectedAccount || "all");
  const [accounts, setAccounts] = useState<Account[]>(state?.accounts || []);
  const [transactions, setTransactions] = useState<Transaction[]>(state?.transactions || []);
  
  // Set default data if not provided in location state
  useEffect(() => {
    if (!state?.accounts || !state?.transactions) {
      console.warn("No account or transaction data provided in navigation state");
      // Here you could fetch data from an API if needed
    }
  }, [state]);
  
  const processTransactions = () => {
    // Handle case when transactions array might be undefined
    const transactionsToProcess = transactions || [];
    
    const filtered = transactionsToProcess.filter(trans => {
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
    // Handle case when transactions array might be undefined
    const transactionsToProcess = transactions || [];
    
    const filtered = transactionsToProcess.filter(trans => {
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
  
  const handleGoBack = () => {
    navigate('/cash-bank');
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 text-white hover:bg-white/20"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-white">Cashflow Analysis</h1>
              <p className="text-white/80">Analyze your cash flow patterns and trends</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Cash Flow Dashboard</h2>
              <p className="text-muted-foreground">Monitor your cash movements across all accounts</p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          
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
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingTransactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.date.toLocaleDateString()} · {tx.status}
                          </p>
                        </div>
                        <div className={`text-sm font-medium ${tx.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'inflow' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-3">
              <Tabs defaultValue="cashflow">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                    <TabsTrigger value="balance">Running Balance</TabsTrigger>
                    <TabsTrigger value="comparison">Income vs. Expenses</TabsTrigger>
                  </TabsList>
                </div>
                
                <Card>
                  <CardContent className="pt-6">
                    <TabsContent value="cashflow" className="h-[400px]">
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
                    
                    <TabsContent value="balance" className="h-[400px]">
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
                    
                    <TabsContent value="comparison" className="h-[400px]">
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
                  </CardContent>
                </Card>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowAnalysisPage;
