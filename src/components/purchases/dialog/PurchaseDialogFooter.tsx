
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { getPurchaseTypeLabel } from "@/utils/purchaseDialogUtils";
import { PurchaseType } from "@/types/purchase";

interface PurchaseDialogFooterProps {
  type: PurchaseType;
}

export function PurchaseDialogFooter({ type }: PurchaseDialogFooterProps) {
  return (
    <DialogFooter>
      <Button type="submit">Add {getPurchaseTypeLabel(type)}</Button>
    </DialogFooter>
  );
}
