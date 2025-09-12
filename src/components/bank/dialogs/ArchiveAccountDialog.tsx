
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

interface ArchiveAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
  onArchive: (account: Account) => void;
}

export function ArchiveAccountDialog({ 
  open, 
  onOpenChange, 
  account, 
  onArchive 
}: ArchiveAccountDialogProps) {
  const handleArchiveConfirm = () => {
    onArchive(account);
    onOpenChange(false);
    toast.success("Account archived successfully");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive this account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchiveConfirm}>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
