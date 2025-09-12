
import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPurchaseTypeLabel } from "@/utils/purchaseDialogUtils";
import { PurchaseType } from "@/types/purchase";

interface PurchaseDialogHeaderProps {
  type: PurchaseType;
}

export function PurchaseDialogHeader({ type }: PurchaseDialogHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>Add New {getPurchaseTypeLabel(type)}</DialogTitle>
    </DialogHeader>
  );
}
