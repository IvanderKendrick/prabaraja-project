
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { UIAsset } from "@/pages/Assets";

interface SellAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (soldAsset: {
    originalAssetId: string;
    assetTag: string;
    assetName: string;
    assetType: string;
    dateSold: string;
    soldTo: string;
    salePrice: number;
    boughtPrice: number;
    profitLoss: number;
    saleReason?: string;
    transactionNo?: string;
    notes?: string;
  }) => void;
  asset: UIAsset;
}

export const SellAssetDialog = ({ open, onOpenChange, onSubmit, asset }: SellAssetDialogProps) => {
  const [formData, setFormData] = useState({
    dateSold: new Date().toISOString().split('T')[0],
    soldTo: "",
    salePrice: asset.currentValue,
    saleReason: "",
    transactionNo: "",
    notes: ""
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.soldTo || !formData.salePrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    const profitLoss = Number(formData.salePrice) - asset.purchasePrice;
    
    onSubmit({
      originalAssetId: asset.id,
      assetTag: asset.tag,
      assetName: asset.name,
      assetType: asset.type,
      dateSold: formData.dateSold,
      soldTo: formData.soldTo,
      salePrice: Number(formData.salePrice),
      boughtPrice: asset.purchasePrice,
      profitLoss,
      saleReason: formData.saleReason,
      transactionNo: formData.transactionNo,
      notes: formData.notes
    });

    toast.success("Asset sold successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell Asset: {asset.tag}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateSold">Sale Date *</Label>
              <Input
                id="dateSold"
                type="date"
                value={formData.dateSold}
                onChange={(e) => handleChange('dateSold', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price (Rp) *</Label>
              <Input
                id="salePrice"
                type="number"
                value={formData.salePrice}
                onChange={(e) => handleChange('salePrice', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="soldTo">Sold To *</Label>
            <Input
              id="soldTo"
              value={formData.soldTo}
              onChange={(e) => handleChange('soldTo', e.target.value)}
              placeholder="Buyer name or company"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="saleReason">Reason for Sale</Label>
            <Select
              value={formData.saleReason}
              onValueChange={(value) => handleChange('saleReason', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upgrade">Upgrade</SelectItem>
                <SelectItem value="obsolete">Obsolete</SelectItem>
                <SelectItem value="downsizing">Downsizing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transactionNo">Transaction/Invoice No</Label>
              <Input
                id="transactionNo"
                value={formData.transactionNo}
                onChange={(e) => handleChange('transactionNo', e.target.value)}
                placeholder="Optional reference number"
              />
            </div>
            <div className="space-y-2">
              <Label>Original Value</Label>
              <div className="text-sm py-2 px-3 border rounded">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(asset.purchasePrice)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional information"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Sale</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
