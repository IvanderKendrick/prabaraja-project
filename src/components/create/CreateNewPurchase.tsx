
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { PurchaseFormHeader } from "@/components/purchases/PurchaseFormHeader";
import { CreatePurchaseForm } from "@/components/create/CreatePurchaseForm";
import { PurchaseType } from "@/types/purchase";
import { 
  useCreateInvoice,
  useCreateOffer,
  useCreateOrder,
  useCreateRequest,
  useCreateShipment
} from "@/hooks/usePurchases";
import { useCreatePurchaseQuotation } from "@/hooks/usePurchaseQuotations";
import { CreatePurchaseQuotationForm } from "@/components/purchases/forms/CreatePurchaseQuotationForm";

const CreateNewPurchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const typeFromUrl = searchParams.get("type") as PurchaseType || "invoice";
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(typeFromUrl);
  
  const createInvoiceMutation = useCreateInvoice();
  const createOfferMutation = useCreateOffer();
  const createOrderMutation = useCreateOrder();
  const createRequestMutation = useCreateRequest();
  const createShipmentMutation = useCreateShipment();
  const createQuotationMutation = useCreatePurchaseQuotation();

  const handleSubmit = async (formData: any) => {
    try {
      console.log('Submitting form data:', formData);
      
      const baseData = {
        number: Date.now(), // Generate a unique number
        type: formData.type || purchaseType,
        date: formData.date,
        due_date: formData.dueDate,
        status: formData.status || "pending",
        tags: formData.tags || [],
        items: formData.items || [],
        grand_total: formData.grandTotal || 0
      };

      console.log('Base data:', baseData);

      switch (purchaseType) {
        case "invoice":
          await createInvoiceMutation.mutateAsync({
            ...baseData,
            approver: formData.approver || "Unknown",
            tax_calculation_method: formData.taxCalculationMethod || false,
            ppn_percentage: formData.ppnPercentage,
            pph_percentage: formData.pphPercentage,
            pph_type: formData.pphType,
            dpp: formData.dpp,
            ppn: formData.ppn,
            pph: formData.pph
          });
          break;
        case "offer":
          await createOfferMutation.mutateAsync({
            ...baseData,
            expiry_date: formData.expiryDate,
            discount_terms: formData.discountTerms || ""
          });
          break;
        case "order":
          await createOrderMutation.mutateAsync({
            ...baseData,
            orders_date: formData.orderDate || formData.date
          });
          break;
        case "request":
          console.log('Creating request with data:', {
            ...baseData,
            requested_by: formData.requestedBy,
            urgency: formData.urgency
          });
          await createRequestMutation.mutateAsync({
            ...baseData,
            requested_by: formData.requestedBy || "Unknown",
            urgency: formData.urgency || "Medium"
          });
          break;
        case "shipment":
          await createShipmentMutation.mutateAsync({
            ...baseData,
            tracking_number: formData.trackingNumber || "",
            carrier: formData.carrier || "",
            shipping_date: formData.shippingDate || formData.date
          });
          break;
        case "quotation":
          await createQuotationMutation.mutateAsync({
            number: formData.number,
            vendor_name: formData.vendorName,
            quotation_date: formData.quotationDate,
            valid_until: formData.validUntil,
            status: formData.status,
            items: formData.items,
            total: formData.total,
            terms: formData.terms
          });
          break;
      }

      toast.success("Purchase created successfully");
      navigate("/purchases");
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error("Failed to create purchase. Please check the console for details.");
    }
  };

  const isLoading = createInvoiceMutation.isPending || createOfferMutation.isPending || 
                   createOrderMutation.isPending || createRequestMutation.isPending || 
                   createShipmentMutation.isPending || createQuotationMutation.isPending;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <PurchaseFormHeader purchaseType={purchaseType} />

        <div className="p-6 max-w-5xl mx-auto">
          {purchaseType === "quotation" ? (
            <CreatePurchaseQuotationForm onSubmit={handleSubmit} />
          ) : (
            <CreatePurchaseForm 
              purchaseType={purchaseType}
              setPurchaseType={setPurchaseType}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateNewPurchase;
