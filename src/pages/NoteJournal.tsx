import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Paperclip, Calendar, ArrowLeft, Trash2 } from "lucide-react";
import {
  useCOAAccounts,
  useCreateJournal,
  type CreateJournalPayload,
  type JournalDetail,
} from "@/hooks/useMasterDataAPI";
import {
  formatInputCurrency,
  parseInputCurrency,
  formatCurrency,
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface JournalEntry {
  id: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
}

const NoteJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: "1", account: "", description: "", debit: 0, credit: 0 },
  ]);
  const [transactionNumber, setTransactionNumber] = useState("[Auto]");
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [tag, setTag] = useState("");
  const [memo, setMemo] = useState("");

  const { data: chartOfAccounts } = useCOAAccounts();
  const { toast } = useToast();
  const { createJournal, loading: creatingJournal } = useCreateJournal();
  const navigate = useNavigate();

  const formatPriceDisplay = (price: number) => {
    return price === 0
      ? ""
      : new Intl.NumberFormat("id-ID", {
          style: "decimal",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price);
  };

  const handleDebitChange = (id: string, value: string) => {
    const numericValue = parseInputCurrency(value);
    setEntries((prev) => {
      const newEntries = prev.map((entry) =>
        entry.id === id ? { ...entry, debit: numericValue, credit: 0 } : entry
      );

      // Auto-balance logic: find next empty row and set credit
      const currentIndex = newEntries.findIndex((entry) => entry.id === id);
      const nextIndex = currentIndex + 1;

      if (nextIndex < newEntries.length && numericValue > 0) {
        newEntries[nextIndex] = {
          ...newEntries[nextIndex],
          credit: numericValue,
          debit: 0,
        };
      } else if (numericValue > 0 && nextIndex >= newEntries.length) {
        // Add new row with credit
        const newId = (newEntries.length + 1).toString();
        newEntries.push({
          id: newId,
          account: "",
          description: "",
          debit: 0,
          credit: numericValue,
        });
      }

      return newEntries;
    });
  };

  const handleCreditChange = (id: string, value: string) => {
    const numericValue = parseInputCurrency(value);
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, credit: numericValue, debit: 0 } : entry
      )
    );
  };

  const handleAccountChange = (id: string, account: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, account } : entry))
    );
  };

  const handleDescriptionChange = (id: string, description: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, description } : entry))
    );
  };

  const addNewRow = () => {
    const newId = (entries.length + 1).toString();
    setEntries((prev) => [
      ...prev,
      { id: newId, account: "", description: "", debit: 0, credit: 0 },
    ]);
  };

  const removeRow = (id: string) => {
    if (entries.length > 1) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async () => {
    if (!isBalanced) {
      toast({
        title: "Validation Error",
        description: "Total Debit must equal Total Credit",
        variant: "destructive",
      });
      return;
    }

    // Check if all entries have account and description
    const hasEmptyFields = entries.some(
      (entry) =>
        (entry.debit > 0 || entry.credit > 0) &&
        (!entry.account || !entry.description)
    );

    if (hasEmptyFields) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all account and description fields for entries with amounts",
        variant: "destructive",
      });
      return;
    }

    // Validate transaction date
    if (!transactionDate || isNaN(transactionDate.getTime())) {
      toast({
        title: "Validation Error",
        description: "Please select a valid transaction date",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create journal entries using the new API structure
      const validEntries = entries.filter(
        (entry) => entry.debit > 0 || entry.credit > 0
      );

      if (validEntries.length > 0) {
        const journalDetails: JournalDetail[] = validEntries.map((entry) => ({
          account_code: entry.account,
          debit: entry.debit,
          credit: entry.credit,
          description: entry.description,
        }));

        const totalDebit = validEntries.reduce(
          (sum, entry) => sum + entry.debit,
          0
        );
        const totalCredit = validEntries.reduce(
          (sum, entry) => sum + entry.credit,
          0
        );

        // Safely format date
        const formattedDate = transactionDate.toISOString().split("T")[0];

        const payload: CreateJournalPayload = {
          action: "addNewJournal",
          journal_code: transactionNumber,
          date: formattedDate,
          tag: tag || "General",
          journal_details: journalDetails,
          memo: memo,
          total_debit: totalDebit,
          total_credit: totalCredit,
          attachment_url: null,
        };

        // Debug payload before sending
        console.log("Journal Payload:", JSON.stringify(payload, null, 2));

        await createJournal(payload);

        toast({
          title: "Success",
          description: "Journal entry created successfully",
        });
      }

      // Reset form
      setEntries([
        { id: "1", account: "", description: "", debit: 0, credit: 0 },
      ]);
      setTransactionDate(new Date());
      setTag("");
      setMemo("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="px-6 pt-8">
          <div className="text-sm mb-1">Transaction</div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/master-data")}
              className="bg-white hover:bg-white/90"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold ">General Journal</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Header */}
          <div className="grid grid-cols-3 gap-4p-4 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="transaction-number">
                Transaction Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transaction-number"
                value={transactionNumber}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-date">
                Transaction Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !transactionDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {transactionDate ? (
                      format(transactionDate, "dd/MM/yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={transactionDate}
                    onSelect={setTransactionDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Enter tag"
              />
            </div>
          </div>
          {/* Journal Entry Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="w-[250px]">
                    Account <span className="text-red-500">*</span>
                  </TableHead>
                  <TableHead>
                    Description <span className="text-red-500">*</span>
                  </TableHead>
                  <TableHead className="w-[150px] text-right">Debit</TableHead>
                  <TableHead className="w-[150px] text-right">Credit</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Select
                        value={entry.account}
                        onValueChange={(value) =>
                          handleAccountChange(entry.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {chartOfAccounts
                            ?.filter((account) =>
                              [1, 2, 3].includes(account.level)
                            )
                            .map((account) => (
                              <SelectItem
                                key={account.id}
                                value={account.account_code}
                              >
                                {account.account_code} - {account.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.description}
                        onChange={(e) =>
                          handleDescriptionChange(entry.id, e.target.value)
                        }
                        placeholder="Enter description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatPriceDisplay(entry.debit)}
                        onChange={(e) =>
                          handleDebitChange(entry.id, e.target.value)
                        }
                        placeholder="0"
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatPriceDisplay(entry.credit)}
                        onChange={(e) =>
                          handleCreditChange(entry.id, e.target.value)
                        }
                        placeholder="0"
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(entry.id)}
                        disabled={entries.length === 1}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Data Button */}
          <Button onClick={addNewRow} variant="default" className=" text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
            <div className="space-y-2">
              <Label>Total Debit</Label>
              <div className="text-right font-mono text-lg bg-green-50 p-2 rounded border">
                Rp. {formatPriceDisplay(totalDebit)}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total Credit</Label>
              <div className="text-right font-mono text-lg bg-green-50 p-2 rounded border">
                Rp. {formatPriceDisplay(totalCredit)}
              </div>
            </div>
          </div>

          {/* Balance Status */}
          <div className="text-center">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isBalanced
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
            </div>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">
              Memo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Enter memo (optional)"
              rows={3}
            />
          </div>

          {/* Attachment */}
          <div className="space-y-2">
            <Label>📎 Attachment</Label>
            <Button variant="outline" className="w-full">
              <Paperclip className="mr-2 h-4 w-4" />
              Attach File
            </Button>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => navigate("/master-data")}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isBalanced || creatingJournal}
              className=""
            >
              {creatingJournal ? "Saving..." : "Save Journal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteJournal;
