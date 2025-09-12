
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { FileDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

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
  reference?: string;
  category?: string;
}

interface TransactionHistoryDialogProps {
  account: Account;
  transactions: Transaction[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransactionHistoryDialog({ 
  account, 
  transactions, 
  open, 
  onOpenChange 
}: TransactionHistoryDialogProps) {
  // Filter transactions for this account
  const accountTransactions = transactions.filter(
    trans => trans.accountCode === account.code
  ).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Group transactions by month
  const groupByMonth = (transactions: Transaction[]) => {
    const grouped: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      const yearMonth = format(transaction.date, "yyyy-MM");
      if (!grouped[yearMonth]) {
        grouped[yearMonth] = [];
      }
      grouped[yearMonth].push(transaction);
    });
    
    return Object.entries(grouped).map(([yearMonth, transactions]) => ({
      yearMonth,
      monthName: format(new Date(yearMonth + "-01"), "MMMM yyyy"),
      transactions
    }));
  };
  
  const monthlyGroups = groupByMonth(accountTransactions);
  
  // Calculate monthly totals
  const calculateMonthlyTotals = (transactions: Transaction[]) => {
    return transactions.reduce(
      (totals, trans) => {
        if (trans.type === "inflow") {
          totals.inflow += trans.amount;
        } else {
          totals.outflow += trans.amount;
        }
        totals.net = totals.inflow - totals.outflow;
        return totals;
      },
      { inflow: 0, outflow: 0, net: 0 }
    );
  };
  
  const handleExport = () => {
    toast.success("Transaction history exported");
  };

  // If this component is being used as a controlled dialog (from dropdown)
  if (open !== undefined && onOpenChange !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Transaction History: {account.name}</span>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {renderContent(monthlyGroups, accountTransactions, calculateMonthlyTotals)}
        </DialogContent>
      </Dialog>
    );
  }

  // Legacy support for button-triggered dialog
  return (
    <Dialog>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Transaction History: {account.name}</span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {renderContent(monthlyGroups, accountTransactions, calculateMonthlyTotals)}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to render tab content
function renderContent(
  monthlyGroups: { yearMonth: string; monthName: string; transactions: Transaction[] }[],
  accountTransactions: Transaction[],
  calculateMonthlyTotals: (transactions: Transaction[]) => { inflow: number; outflow: number; net: number }
) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All Transactions</TabsTrigger>
        <TabsTrigger value="in">Money In</TabsTrigger>
        <TabsTrigger value="out">Money Out</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        {monthlyGroups.length > 0 ? (
          monthlyGroups.map(group => {
            const totals = calculateMonthlyTotals(group.transactions);
            
            return (
              <div key={group.yearMonth} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">{group.monthName}</h3>
                  <div className="text-sm">
                    <span className="text-green-600 mr-4">In: {formatCurrency(totals.inflow)}</span>
                    <span className="text-red-600 mr-4">Out: {formatCurrency(totals.outflow)}</span>
                    <span className={totals.net >= 0 ? "text-green-600" : "text-red-600"}>
                      Net: {formatCurrency(totals.net)}
                    </span>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.transactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(transaction.date, "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.reference || "-"}</TableCell>
                        <TableCell className={`text-right ${
                          transaction.type === "inflow" ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.type === "inflow" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No transaction history found for this account.
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="in">
        {accountTransactions.filter(t => t.type === "inflow").length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountTransactions
                .filter(t => t.type === "inflow")
                .map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(transaction.date, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.reference || "-"}</TableCell>
                    <TableCell className="text-right text-green-600">
                      +{formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No incoming transactions found for this account.
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="out">
        {accountTransactions.filter(t => t.type === "outflow").length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountTransactions
                .filter(t => t.type === "outflow")
                .map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(transaction.date, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.reference || "-"}</TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No outgoing transactions found for this account.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
