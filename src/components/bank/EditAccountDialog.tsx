
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Account {
  code: string;
  name: string;
  balance: string;
  bankName?: string;
  accountNumber?: string;
}

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onSave: (updatedAccount: Account) => void;
}

const INDONESIAN_BANKS = [
  "Bank Central Asia (BCA)",
  "Bank Mandiri",
  "Bank Rakyat Indonesia (BRI)",
  "Bank Negara Indonesia (BNI)",
  "CIMB Niaga",
  "Bank Danamon",
  "Bank Permata",
  "Panin Bank",
  "Bank OCBC NISP",
  "Bank UOB Indonesia"
];

export function EditAccountDialog({ open, onOpenChange, account, onSave }: EditAccountDialogProps) {
  const [formData, setFormData] = useState<Account | null>(account);

  useEffect(() => {
    setFormData(account);
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && account) {
      onSave({
        ...account,
        ...formData
      });
      onOpenChange(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Make changes to your account details here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={formData?.name || ""}
              onChange={(e) => setFormData({ ...formData!, name: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Select 
              value={formData?.bankName || ""} 
              onValueChange={(value) => setFormData({ ...formData!, bankName: value })}
            >
              <SelectTrigger id="bankName" className="w-full">
                <SelectValue placeholder="Select bank..." />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto bg-white">
                {INDONESIAN_BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={formData?.accountNumber || ""}
              onChange={(e) => setFormData({ ...formData!, accountNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startBalance">Start Balance</Label>
            <Input
              id="startBalance"
              type="number"
              value={formData?.balance?.replace(/[^\d-]/g, '') || ""}
              onChange={(e) => setFormData({ ...formData!, balance: `Rp ${parseInt(e.target.value || "0").toLocaleString('id-ID')}` })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
