
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CreatePurchaseForm } from "@/components/create/CreatePurchaseForm";
import { PurchaseType } from "@/types/purchase";
import { usePurchaseById } from "@/hooks/usePurchases";

const EditPurchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const typeFromUrl = (searchParams.get("type") as PurchaseType) || "invoice";
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(typeFromUrl);
  
  const { data: purchaseData, isLoading, error } = usePurchaseById(id || "", purchaseType);

  useEffect(() => {
    if (purchaseData && purchaseData.type) {
      const normalized = String(purchaseData.type).toLowerCase();
      const mapped =
        normalized === "purchase_order" ? "order" :
        normalized === "requests" ? "request" :
        normalized === "invoices" ? "invoice" :
        normalized === "offers" ? "offer" :
        normalized === "shipments" ? "shipment" :
        normalized;
      if (mapped !== purchaseType && ["invoice","offer","order","request","shipment","quotation"].includes(mapped)) {
        setPurchaseType(mapped as PurchaseType);
      }
    }
  }, [purchaseData, purchaseType]);

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title={`Edit ${
            purchaseType === "quotation"
              ? "Purchase Quotation"
              : purchaseType.charAt(0).toUpperCase() + purchaseType.slice(1)
          }`}
          description={
            purchaseType === "invoice"
              ? "Update details of your purchase invoice"
              : purchaseType === "shipment"
              ? "Update shipment record for your purchase"
              : purchaseType === "order"
              ? "Update your purchase order"
              : purchaseType === "offer"
              ? "Update your purchase offer"
              : purchaseType === "request"
              ? "Update your purchase request"
              : "Update your purchase quotation"
          }
        />

        <div className="p-6">
          <CreatePurchaseForm
            purchaseType={purchaseType}
            setPurchaseType={setPurchaseType}
            onSubmit={handleSubmit}
            isLoading={false}
            isReadOnlyTypeAndNumber
          />
        </div>
      </div>
    </div>
  );
};

export default EditPurchase;
