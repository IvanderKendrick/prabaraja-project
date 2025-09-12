
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { PurchaseFormHeader } from "@/components/purchases/PurchaseFormHeader";
import { CreatePurchaseForm } from "@/components/create/CreatePurchaseForm";
import { PurchaseType } from "@/types/purchase";
import { usePurchaseById } from "@/hooks/usePurchases";

const EditPurchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("invoice");
  
  // Extract type from URL params or determine from data
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get("type") as PurchaseType;
  
  const { data: purchaseData, isLoading, error } = usePurchaseById(id || "", typeFromUrl || purchaseType);

  useEffect(() => {
    if (purchaseData) {
      const dataType = purchaseData.type || typeFromUrl || "invoice";
      // Ensure the type is valid before setting
      if (["invoice", "offer", "order", "request", "shipment"].includes(dataType)) {
        setPurchaseType(dataType as PurchaseType);
      }
    }
  }, [purchaseData, typeFromUrl]);

  const handleSubmit = async (formData: any) => {
    try {
      console.log('Updating purchase with data:', formData);
      // TODO: Implement update logic based on purchase type
      toast.success("Purchase updated successfully");
      navigate("/purchases");
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast.error("Failed to update purchase");
    }
  };

  if (!id) {
    return <div>Invalid purchase ID</div>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-5xl mx-auto">
            <div className="text-center">Loading purchase...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-5xl mx-auto">
            <div className="text-center text-red-500">Error loading purchase</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <PurchaseFormHeader purchaseType={purchaseType} />

        <div className="p-6 max-w-5xl mx-auto">
          <CreatePurchaseForm 
            purchaseType={purchaseType}
            setPurchaseType={setPurchaseType}
            onSubmit={handleSubmit}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPurchase;
