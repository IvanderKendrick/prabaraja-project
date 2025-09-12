import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { COAAccount } from '@/hooks/useMasterDataAPI';

interface DeleteCOADialogProps {
  account: COAAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteCOADialog = ({ account, open, onOpenChange, onSuccess }: DeleteCOADialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCOAAccount = async (accountId: string) => {
    try {
      const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
      if (!authDataRaw) {
        throw new Error("No access token found");
      }
      const authData = JSON.parse(authDataRaw);
      const token = authData.access_token;

      const response = await fetch("https://pbw-backend-api.vercel.app/api/dashboard?action=deleteAccountCOA", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: accountId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error("API returned unsuccessful response");
      }

      return result.data;
    } catch (error) {
      console.error("Error deleting COA account:", error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!account) return;

    try {
      setIsDeleting(true);
      await deleteCOAAccount(account.id);
      toast.success('Chart of Account deleted successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chart of Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{account?.name}" ({account?.account_code})? 
            This action cannot be undone and will permanently remove the account from your system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};