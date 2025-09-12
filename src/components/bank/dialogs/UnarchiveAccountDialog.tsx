
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Account {
  code: string;
  name: string;
  balance: string;
  bankName?: string;
  accountNumber?: string;
  archived?: boolean;
}

interface UnarchiveAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
  onUnarchive: (account: Account) => void;
}

export function UnarchiveAccountDialog({ 
  open, 
  onOpenChange, 
  account, 
  onUnarchive 
}: UnarchiveAccountDialogProps) {
  const handleUnarchiveConfirm = () => {
    onUnarchive(account);
    onOpenChange(false);
    toast.success("Account unarchived successfully");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unarchive Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unarchive this account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnarchiveConfirm}>Unarchive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
