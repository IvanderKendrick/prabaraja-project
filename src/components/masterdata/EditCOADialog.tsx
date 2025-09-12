import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { parseInputCurrency } from '@/lib/utils';
import { COAAccount, EditCOAAccountPayload, useEditCOAAccount } from '@/hooks/useMasterDataAPI';

interface EditCOADialogProps {
  account: COAAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface EditFormData {
  name: string;
  description: string;
  bank_name: string | null;
  tax: string;
  user_access: string;
  lock_option: boolean;
}

export const EditCOADialog = ({ account, open, onOpenChange, onSuccess }: EditCOADialogProps) => {
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    description: '',
    tax: 'Non-Taxable',
    bank_name: null,
    user_access: 'All Users',
    lock_option: false
  });
  
  const { editCOAAccount, loading: isUpdating } = useEditCOAAccount();

  // Initialize form data when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        description: account.description || '',
        tax: account.tax || 'Non-Taxable',
        bank_name: account.bank_name,
        user_access: account.user_access,
        lock_option: account.lock_option
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload: EditCOAAccountPayload = {
        action: "editAccountCOA",
        id: account.id,
        name: formData.name,
        description: formData.description,
        bank_name: formData.bank_name,
        tax: formData.tax,
        user_access: formData.user_access,
        lock_option: formData.lock_option
      };
      
      await editCOAAccount(payload);
      
      toast.success('Chart of Account updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to update account');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Chart of Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              value={formData.bank_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value || null }))}
              placeholder="Enter bank name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax">Tax</Label>
            <Select value={formData.tax} onValueChange={(value) => setFormData(prev => ({ ...prev, tax: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Non-Taxable">Non-Taxable</SelectItem>
                <SelectItem value="Taxable">Taxable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_access">User Access</Label>
            <Select value={formData.user_access} onValueChange={(value) => setFormData(prev => ({ ...prev, user_access: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select user access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Users">All Users</SelectItem>
                <SelectItem value="Limited Users">Limited Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lock_option">Lock Option</Label>
            <Select value={formData.lock_option.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, lock_option: value === 'true' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select lock option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Unlocked</SelectItem>
                <SelectItem value="true">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};