import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCOAAccount, useCOAAccounts, type CreateCOAAccountPayload } from '@/hooks/useMasterDataAPI';
import { toast } from 'sonner';
import { parseInputCurrency } from '@/lib/utils';

interface CreateCOADialogProps {
  children: React.ReactNode;
}

export const CreateCOADialog = ({ children }: CreateCOADialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_code: '',
    name: '',
    category: '',
    level: 1,
    parent_code: null as string | null,
    parent_id: null as string | null,
    detail_type: 'Parent Account',
    detail_desc: '',
    tax: 'Non-Taxable',
    bank_name: null as string | null,
    entry_balance: 0,
    description: '',
    user_access: 'All Users',
    lock_option: false
  });

  const { createCOAAccount, loading: isCreating } = useCreateCOAAccount();
  const { data: existingAccounts } = useCOAAccounts();

  // Category code mapping for auto-generation
  const categoryCodeMap: Record<string, string> = {
    'Kas & Bank': '110100',
    'Akun Piutang': '120100',
    'Persediaan': '130100',
    'Aktiva Lancar Lainnya': '140100',
    'Aktiva Tetap': '150100',
    'Hutang': '200100',
    'Modal': '300100',
    'Pendapatan': '400100',
    'Beban': '700100'
  };

  // Auto-generate account code when category changes
  useEffect(() => {
    if (formData.category && categoryCodeMap[formData.category]) {
      const baseCode = parseInt(categoryCodeMap[formData.category]);
      const suggestedCode = (baseCode + 1).toString();
      setFormData(prev => ({ ...prev, account_code: suggestedCode }));
    }
  }, [formData.category]);

  const formatPriceDisplay = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleBalanceChange = (value: string) => {
    const numericValue = parseInputCurrency(value);
    setFormData(prev => ({ ...prev, entry_balance: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_code || !formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for duplicate account code
    const isDuplicateCode = existingAccounts?.some(
      account => account.account_code.toLowerCase() === formData.account_code.toLowerCase()
    );
    
    if (isDuplicateCode) {
      toast.error('Account code already exists. Please use a different account code.');
      return;
    }

    // Check for duplicate account name
    const isDuplicateName = existingAccounts?.some(
      account => account.name.toLowerCase() === formData.name.toLowerCase()
    );
    
    if (isDuplicateName) {
      toast.error('Account name already exists. Please use a different account name.');
      return;
    }

    try {
      const payload: CreateCOAAccountPayload = {
        action: "addNewAccountCOA",
        name: formData.name,
        account_code: formData.account_code,
        category: formData.category,
        level: formData.level,
        parent_code: formData.parent_code,
        parent_id: formData.parent_id,
        detail_type: formData.detail_type,
        detail_desc: formData.detail_desc || null,
        tax: formData.tax,
        bank_name: formData.bank_name,
        entry_balance: formData.entry_balance,
        description: formData.description,
        user_access: formData.user_access,
        lock_option: formData.lock_option
      };

      // Debug payload before sending
      console.log('COA Creation Payload:', JSON.stringify(payload, null, 2));

      await createCOAAccount(payload);
      
      toast.success('Chart of Account created successfully');
      
      setOpen(false);
      setFormData({
        account_code: '',
        name: '',
        category: '',
        level: 1,
        parent_code: null,
        parent_id: null,
        detail_type: 'Parent Account',
        detail_desc: '',
        tax: 'Non-Taxable',
        bank_name: null,
        entry_balance: 0,
        description: '',
        user_access: 'All Users',
        lock_option: false
      });
      
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to create Chart of Account');
      console.error('Error creating COA:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chart of Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_code">Account Code <span className="text-red-500">*</span></Label>
            <Input
              id="account_code"
              value={formData.account_code}
              onChange={(e) => setFormData(prev => ({ ...prev, account_code: e.target.value }))}
              placeholder="Enter account code"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Account Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter account name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kas & Bank">Kas & Bank</SelectItem>
                <SelectItem value="Akun Piutang">Akun Piutang</SelectItem>
                <SelectItem value="Persediaan">Persediaan</SelectItem>
                <SelectItem value="Aktiva Lancar Lainnya">Aktiva Lancar Lainnya</SelectItem>
                <SelectItem value="Aktiva Tetap">Aktiva Tetap</SelectItem>
                <SelectItem value="Hutang">Hutang</SelectItem>
                <SelectItem value="Modal">Modal</SelectItem>
                <SelectItem value="Pendapatan">Pendapatan</SelectItem>
                <SelectItem value="Beban">Beban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry_balance">Initial Balance (IDR)</Label>
            <Input
              id="entry_balance"
              type="text"
              inputMode="numeric"
              value={formatPriceDisplay(formData.entry_balance)}
              onChange={(e) => handleBalanceChange(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};