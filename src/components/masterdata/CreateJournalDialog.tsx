import { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateJournal, type COAAccount, type CreateJournalPayload, type JournalDetail } from '@/hooks/useMasterDataAPI';

interface CreateJournalDialogProps {
  children: React.ReactNode;
  coaAccounts: COAAccount[];
}

export function CreateJournalDialog({ children, coaAccounts }: CreateJournalDialogProps) {
  const [open, setOpen] = useState(false);
  // Helper function to safely format date
  const getSafeISODate = (date: Date = new Date()): string => {
    try {
      if (!date || isNaN(date.getTime())) {
        date = new Date();
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  const [formData, setFormData] = useState({
    journal_code: `JRNL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
    date: getSafeISODate(),
    tag: '',
    memo: '',
    attachment_url: '',
    account_code: '',
    description: '',
    debit: '0',
    credit: '0',
  });

  const { createJournal, loading: isCreating } = useCreateJournal();

  const parseInputCurrency = (value: string): number => {
    const cleanString = value.replace(/[^\d]/g, '');
    return parseInt(cleanString) || 0;
  };

  const formatCurrency = (value: string): string => {
    const numericValue = parseInputCurrency(value);
    return new Intl.NumberFormat('id-ID').format(numericValue);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'debit' || field === 'credit') {
      setFormData(prev => ({ ...prev, [field]: formatCurrency(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.account_code || !formData.description || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate date
    const dateObj = new Date(formData.date);
    if (!formData.date || isNaN(dateObj.getTime())) {
      toast.error('Please select a valid date');
      return;
    }

    const debitAmount = parseInputCurrency(formData.debit);
    const creditAmount = parseInputCurrency(formData.credit);

    if (debitAmount === 0 && creditAmount === 0) {
      toast.error('Either debit or credit amount must be greater than 0');
      return;
    }

    if (debitAmount > 0 && creditAmount > 0) {
      toast.error('Please enter either debit or credit amount, not both');
      return;
    }

    try {
      const journalDetail: JournalDetail = {
        account_code: formData.account_code,
        debit: debitAmount,
        credit: creditAmount,
        description: formData.description,
      };

      const payload: CreateJournalPayload = {
        action: "addNewJournal",
        journal_code: formData.journal_code,
        date: formData.date,
        tag: formData.tag || "General",
        journal_details: [journalDetail],
        memo: formData.memo,
        total_debit: debitAmount,
        total_credit: creditAmount,
        attachment_url: formData.attachment_url || null,
      };

      await createJournal(payload);
      
      toast.success('Journal entry created successfully');
      setOpen(false);
      setFormData({
        journal_code: `JRNL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
        date: getSafeISODate(),
        tag: '',
        memo: '',
        attachment_url: '',
        account_code: '',
        description: '',
        debit: '0',
        credit: '0',
      });
      
      // Refresh the page or trigger refetch
      window.location.reload();
    } catch (error) {
      toast.error('Failed to create journal entry');
      console.error('Error creating journal:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Journal Entry</DialogTitle>
          <DialogDescription>
            Add a new journal entry to the system. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="journal_code">Journal Code</Label>
            <Input
              id="journal_code"
              value={formData.journal_code}
              onChange={(e) => handleInputChange('journal_code', e.target.value)}
              placeholder="Journal code"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              value={formData.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
              placeholder="Enter tag (e.g., Monthly Closing)"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account_code">COA Account</Label>
            <Select value={formData.account_code} onValueChange={(value) => handleInputChange('account_code', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select COA Account" />
              </SelectTrigger>
              <SelectContent>
                      {coaAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.account_code}>
                          {account.account_code} - {account.name}
                        </SelectItem>
                      ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="debit">Debit Amount</Label>
              <Input
                id="debit"
                value={formData.debit}
                onChange={(e) => handleInputChange('debit', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credit">Credit Amount</Label>
              <Input
                id="credit"
                value={formData.credit}
                onChange={(e) => handleInputChange('credit', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="memo">Memo</Label>
            <Input
              id="memo"
              value={formData.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
              placeholder="Enter memo (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Journal Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}