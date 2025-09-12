import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { AssetsTable } from "@/components/assets/AssetsTable";
import { SoldAssetsTable } from "@/components/assets/SoldAssetsTable";
import { SellAssetDialog } from "@/components/assets/SellAssetDialog";
import { toast } from "sonner";
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset, type Asset } from "@/hooks/useAssets";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useRealtime } from "@/hooks/useRealtime";

export interface UIAsset {
  id: string;
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
  currentValue: number;
  warrantyDeadline: string;
  manufacturer?: string;
  serialNumber?: string;
}

export interface SoldAsset {
  id: string;
  originalAssetId: string;
  assetTag: string;
  assetName: string;
  assetType: string;
  dateSold: string;
  soldTo: string;
  salePrice: number;
  boughtPrice: number;
  profitLoss: number;
  saleReason?: "upgrade" | "obsolete" | "downsizing" | "other";
  transactionNo?: string;
  notes?: string;
}

const Assets = () => {
  const { tab } = useParams();
  const location = useLocation();
  const validTabs = useMemo(() => ["current", "sold"], []);
  const initialTab = validTabs.includes(tab as string) ? (tab as string) : "current";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
  useEffect(() => {
    const nextTab = validTabs.includes(tab as string) ? (tab as string) : "current";
    if (nextTab !== activeTab) setActiveTab(nextTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, location.pathname]);

  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<UIAsset | null>(null);
  
  // Enable real-time updates
  useRealtime();
  
  // Get role access permissions
  const { canCreateData, canEditData, canDeleteData } = useRoleAccess();
  
  // Supabase hooks
  const { data: supabaseAssets = [], isLoading, error } = useAssets();
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  // Define calculateCurrentValue function before using it
  const calculateCurrentValue = (price: number, purchaseDate: string) => {
    // Simplified straight-line depreciation (20% per year)
    const years = (new Date().getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(0, price * (1 - 0.2 * years));
  };

  // Transform Supabase assets to UI format
  const assets: UIAsset[] = supabaseAssets
    .filter(asset => !asset.sale_date) // Only show unsold assets
    .map(asset => ({
      id: asset.id,
      tag: `AST-${new Date(asset.purchase_date).getFullYear()}-${String(asset.asset_tag).padStart(3, '0')}`,
      type: asset.asset_type as "computer" | "furniture" | "vehicle" | "other",
      name: asset.asset_name,
      model: asset.model || "",
      assignedTo: {
        name: asset.assigned_to,
        department: asset.department,
      },
      purchaseDate: asset.purchase_date,
      purchasePrice: Number(asset.purchase_price),
      currentValue: calculateCurrentValue(Number(asset.purchase_price), asset.purchase_date),
      warrantyDeadline: asset.warranty_deadline || "",
      manufacturer: asset.manufacturer,
      serialNumber: asset.serial_number,
    }));

  // Get sold assets
  const soldAssets: SoldAsset[] = supabaseAssets
    .filter(asset => asset.sale_date) // Only show sold assets
    .map(asset => ({
      id: asset.id,
      originalAssetId: asset.id,
      assetTag: `AST-${new Date(asset.purchase_date).getFullYear()}-${String(asset.asset_tag).padStart(3, '0')}`,
      assetName: asset.asset_name,
      assetType: asset.asset_type,
      dateSold: asset.sale_date || "",
      soldTo: asset.sold_to || "",
      salePrice: Number(asset.sale_price || 0),
      boughtPrice: Number(asset.purchase_price),
      profitLoss: Number(asset.sale_price || 0) - Number(asset.purchase_price),
      saleReason: asset.reason_for_sale as "upgrade" | "obsolete" | "downsizing" | "other" | undefined,
      notes: asset.notes,
    }));

  const handleAddAsset = async (newAsset: Omit<UIAsset, "id" | "currentValue">) => {
    try {
      // Generate next asset tag number
      const currentYear = new Date().getFullYear();
      const existingTags = supabaseAssets
        .map(asset => asset.asset_tag)
        .filter(tag => tag !== null);
      const maxTag = existingTags.length > 0 ? Math.max(...existingTags) : 0;
      const nextTagNumber = maxTag + 1;

      const assetData = {
        asset_tag: nextTagNumber,
        asset_type: newAsset.type,
        asset_name: newAsset.name,
        model: newAsset.model,
        assigned_to: newAsset.assignedTo.name,
        department: newAsset.assignedTo.department,
        manufacturer: newAsset.manufacturer,
        serial_number: newAsset.serialNumber,
        purchase_date: newAsset.purchaseDate,
        purchase_price: newAsset.purchasePrice,
        warranty_deadline: newAsset.warrantyDeadline,
        status: 'Active',
      };

      await createAssetMutation.mutateAsync(assetData);
      setIsAddDialogOpen(false);
      toast.success("Asset added successfully");
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error("Failed to add asset");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!canDeleteData) {
      toast.error("You don't have permission to delete assets");
      return;
    }

    try {
      await deleteAssetMutation.mutateAsync(id);
      toast.success("Asset deleted successfully");
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error("Failed to delete asset");
    }
  };

  const handleDeleteSoldAsset = async (id: string) => {
    if (!canDeleteData) {
      toast.error("You don't have permission to delete sold asset records");
      return;
    }

    try {
      await deleteAssetMutation.mutateAsync(id);
      toast.success("Sold asset record deleted");
    } catch (error) {
      console.error('Error deleting sold asset:', error);
      toast.error("Failed to delete sold asset record");
    }
  };

  const handleSellAsset = (asset: UIAsset) => {
    if (!canEditData) {
      toast.error("You don't have permission to sell assets");
      return;
    }
    setSelectedAsset(asset);
    setIsSellDialogOpen(true);
  };

  const handleConfirmSale = async (soldAssetData: {
    dateSold: string;
    soldTo: string;
    salePrice: number;
    saleReason?: string;
    transactionNo?: string;
    notes?: string;
  }) => {
    if (!selectedAsset) return;

    try {
      const validReasons = ["upgrade", "obsolete", "downsizing", "other"] as const;
      const saleReason = validReasons.includes(soldAssetData.saleReason as any) 
        ? soldAssetData.saleReason as typeof validReasons[number]
        : undefined;

      const updateData = {
        sale_date: soldAssetData.dateSold,
        sold_to: soldAssetData.soldTo,
        sale_price: soldAssetData.salePrice,
        reason_for_sale: saleReason,
        notes: soldAssetData.notes,
        status: 'Sold',
      };

      await updateAssetMutation.mutateAsync({
        id: selectedAsset.id,
        updates: updateData
      });

      setIsSellDialogOpen(false);
      setSelectedAsset(null);
      toast.success("Asset sold successfully");
    } catch (error) {
      console.error('Error selling asset:', error);
      toast.error("Failed to sell asset");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Header 
            title="Assets" 
            description="Manage your company assets" 
          />
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading assets...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Header 
            title="Assets" 
            description="Manage your company assets" 
          />
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-red-600">Error loading assets: {error.message}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header 
          title="Assets" 
          description="Manage your company assets" 
        />

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 items</SelectItem>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="15">15 items</SelectItem>
                  </SelectContent>
                </Select>
                {canCreateData && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Asset
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="w-full">
              {/* Tabs moved to Sidebar. Navigation handled via Sidebar submenu. */}
              {activeTab === "current" && (
                <AssetsTable 
                  itemsPerPage={Number(itemsPerPage)} 
                  search={search} 
                  assets={assets}
                  onDeleteAsset={handleDeleteAsset}
                  onSellAsset={handleSellAsset}
                  isAdmin={canEditData}
                />
              )}

              {activeTab === "sold" && (
                <SoldAssetsTable
                  itemsPerPage={Number(itemsPerPage)}
                  search={search}
                  soldAssets={soldAssets}
                  onDeleteSoldAsset={handleDeleteSoldAsset}
                  isAdmin={canDeleteData}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <AddAssetDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSubmit={handleAddAsset}
        existingAssets={assets}
      />

      {selectedAsset && (
        <SellAssetDialog
          open={isSellDialogOpen}
          onOpenChange={setIsSellDialogOpen}
          onSubmit={handleConfirmSale}
          asset={selectedAsset}
        />
      )}
    </div>
  );
};

export default Assets;
