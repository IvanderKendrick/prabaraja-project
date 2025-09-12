
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getRoleDisplayName } from "@/utils/roleUtils";

interface ConfirmRoleChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
  currentRole: string;
  newRole: string;
  isLoading: boolean;
}

export const ConfirmRoleChangeDialog = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  currentRole,
  newRole,
  isLoading,
}: ConfirmRoleChangeDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change the role for{" "}
            <span className="font-semibold">{userEmail}</span> from{" "}
            <span className="font-semibold">{getRoleDisplayName(currentRole)}</span> to{" "}
            <span className="font-semibold">{getRoleDisplayName(newRole)}</span>?
            <br />
            <br />
            This action cannot be undone and will immediately affect the user's permissions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Updating..." : "Confirm Change"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
