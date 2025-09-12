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
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Asset {
  id?: string; 
  tag: string;
  type: "computer" | "furniture" | "vehicle" | "other";
  name: string;
  model: string;
  assignedTo: {
    name: string;
    department: string;
    avatar?: string;
  };
  purchaseDate: string;
  purchasePrice: number;
  currentValue?: number; 
  warrantyDeadline: string;
  manufacturer?: string;
  serialNumber?: string;
}

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (asset: Omit<Asset, "id" | "currentValue">) => void;
  existingAssets: Asset[];
}

export const AddAssetDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  existingAssets 
}: AddAssetDialogProps) => {
  const [formData, setFormData] = useState<Omit<Asset, "id" | "currentValue">>({
    tag: "",
    type: "computer",
    name: "",
    model: "",
    assignedTo: {
      name: "",
      department: "",
    },
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    warrantyDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    manufacturer: "",
    serialNumber: "",
  });

  // Generate the next asset tag when dialog opens
  useEffect(() => {
    if (open) {
      const currentYear = new Date().getFullYear();
      const assetTags = existingAssets.map(asset => asset.tag);
      
      // Find the highest number for current year
      let maxNumber = 0;
      assetTags.forEach(tag => {
        const match = tag.match(new RegExp(`^AST-${currentYear}-(\\d+)$`));
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });
      
      const nextTag = `AST-${currentYear}-${String(maxNumber + 1).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, tag: nextTag }));
    }
  }, [open, existingAssets]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof typeof formData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object),
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !formData.tag ||
      !formData.name ||
      !formData.purchasePrice ||
      !formData.assignedTo.name ||
      !formData.assignedTo.department
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit(formData);
    toast.success("Asset added successfully");
    
    setFormData(prev => ({
      ...prev,
      type: "computer",
      name: "",
      model: "",
      assignedTo: {
        name: "",
        department: "",
      },
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      warrantyDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manufacturer: "",
      serialNumber: "",
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag">Asset Tag</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => handleChange('tag', e.target.value)}
                placeholder="Auto-generated"
                readOnly 
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Asset Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value as Asset['type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computer">Computer</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., MacBook Pro"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="e.g., M2 16GB"
              />
            </div>
          </div>

          {/* Assignment Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedName">Assigned To (Name) *</Label>
              <Input
                id="assignedName"
                value={formData.assignedTo.name}
                onChange={(e) => handleNestedChange('assignedTo', 'name', e.target.value)}
                placeholder="Employee name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedDept">Department *</Label>
              <Input
                id="assignedDept"
                value={formData.assignedTo.department}
                onChange={(e) => handleNestedChange('assignedTo', 'department', e.target.value)}
                placeholder="Department"
                required
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (Rp) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={formData.purchasePrice || ''}
                onChange={(e) => handleChange('purchasePrice', Number(e.target.value))}
                placeholder="25000000"
                required
              />
            </div>
          </div>

          {/* Warranty Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warrantyDeadline">Warranty Deadline</Label>
              <Input
                id="warrantyDeadline"
                type="date"
                value={formData.warrantyDeadline}
                onChange={(e) => handleChange('warrantyDeadline', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                placeholder="e.g., Apple"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number/Asset Tag</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleChange('serialNumber', e.target.value)}
              placeholder="Unique identifier"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Asset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};