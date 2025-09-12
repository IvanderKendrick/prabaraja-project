import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { formatCurrency, parseInputCurrency, formatInputCurrency } from "@/lib/utils";
import { handleError } from "@/utils/errorHandler";

interface Account {
  code: string;
  name: string;
  balance: string;
  bankName?: string;
  accountNumber?: string;
  archived?: boolean;
  accountType?: string;
}

interface TransferFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromAccount: Account;
  accounts: Account[];
  onTransfer: (from: string, to: string, amount: number, notes: string) => void;
}

const transferFormSchema = z.object({
  fromAccount: z.string().min(1, "Please select a source account"),
  toAccount: z.string().min(1, "Please select a destination account"),
  amount: z.string().min(1, "Amount is required"),
  notes: z.string().optional(),
})
.refine(data => data.fromAccount !== data.toAccount, {
  message: "Source and destination accounts must be different",
  path: ["toAccount"],
});

export function TransferFundsDialog({ 
  open, 
  onOpenChange, 
  fromAccount,
  accounts, 
  onTransfer 
}: TransferFundsDialogProps) {
  const [previewMode, setPreviewMode] = React.useState(false);
  const activeAccounts = accounts.filter(account => !account.archived);
  
  const form = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      fromAccount: fromAccount.code,
      toAccount: "",
      amount: "",
      notes: "",
    },
  });

  const watchFromAccount = form.watch("fromAccount");
  const watchToAccount = form.watch("toAccount");
  const watchAmount = form.watch("amount");
  
  const numericAmount = parseInputCurrency(watchAmount);
  
  // Use fromAccount prop directly for source account data
  const selectedFromAccount = fromAccount;
  const selectedToAccount = activeAccounts.find(acc => acc.code === watchToAccount);
  
  const getAccountBalance = (balanceString: string) => {
    // Handle negative balances properly and improve parsing
    const cleanString = balanceString.replace(/[^\d-]/g, '');
    return parseInt(cleanString) || 0;
  };
  
  const fromAccountBalance = getAccountBalance(fromAccount.balance);
  const insufficientFunds = numericAmount > 0 && numericAmount > fromAccountBalance;
  
  // Check for invalid account type transfers
  const isInvalidTransfer = selectedFromAccount && selectedToAccount && (
    (selectedFromAccount.accountType === 'Credit' && selectedToAccount.accountType === 'Debit') ||
    (selectedFromAccount.accountType === 'Debit' && selectedToAccount.accountType === 'Credit')
  );

  const handleClose = () => {
    form.reset();
    setPreviewMode(false);
    onOpenChange(false);
  };

  const onSubmit = (data: z.infer<typeof transferFormSchema>) => {
    if (previewMode) {
      try {
        onTransfer(
          data.fromAccount,
          data.toAccount,
          parseInputCurrency(data.amount),
          data.notes || ""
        );
        handleClose();
      } catch (error) {
        handleError(error, 'Transfer failed');
      }
    } else {
      setPreviewMode(true);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputCurrency(e.target.value);
    form.setValue("amount", formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {previewMode ? "Confirm Transfer" : "Transfer Funds Between Accounts"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {previewMode ? (
              <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">From Account:</div>
                  <div className="text-sm font-medium">
                    {selectedFromAccount?.name} ({selectedFromAccount?.code})
                  </div>
                  
                  <div className="text-sm text-muted-foreground">To Account:</div>
                  <div className="text-sm font-medium">
                    {selectedToAccount?.name} ({selectedToAccount?.code})
                  </div>
                  
                  <div className="text-sm text-muted-foreground">Amount:</div>
                  <div className="text-sm font-medium">
                    Rp {parseInputCurrency(watchAmount).toLocaleString('id-ID')}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">Current Balance (From):</div>
                  <div className="text-sm font-medium">{selectedFromAccount?.balance}</div>
                  
                  <div className="text-sm text-muted-foreground">New Balance (From):</div>
                  <div className="text-sm font-medium">
                    Rp {(fromAccountBalance - numericAmount).toLocaleString('id-ID')}
                  </div>
                  
                  {form.getValues("notes") && (
                    <>
                      <div className="text-sm text-muted-foreground">Notes:</div>
                      <div className="text-sm font-medium">{form.getValues("notes")}</div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 border rounded-md bg-muted/10">
                  <div className="text-sm font-medium">From Account:</div>
                  <div className="text-sm">
                    {fromAccount.name} ({fromAccount.code}) - {fromAccount.balance}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="toAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Account</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activeAccounts
                            .filter(account => account.code !== fromAccount.code)
                            .map((account) => (
                              <SelectItem key={account.code} value={account.code}>
                                {account.name} - {account.balance}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={handleAmountChange}
                          prefix="Rp"
                        />
                      </FormControl>
                      {insufficientFunds && watchAmount && (
                        <p className="text-sm text-destructive mt-1">
                          Insufficient funds in the source account
                        </p>
                      )}
                      {isInvalidTransfer && (
                        <p className="text-sm text-destructive mt-1">
                          Cannot transfer between Credit and Debit account types
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder="Purpose of transfer or reference"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              
              {previewMode ? (
                <div className="flex gap-2">
                  <Button variant="outline" type="button" onClick={() => setPreviewMode(false)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={insufficientFunds || isInvalidTransfer}>
                    Confirm Transfer
                  </Button>
                </div>
              ) : (
                <Button 
                  type="submit" 
                  disabled={!watchToAccount || !watchAmount || insufficientFunds || isInvalidTransfer}
                >
                  Review Transfer
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}