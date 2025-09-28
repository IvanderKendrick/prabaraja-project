import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CreatePurchaseForm } from "@/components/create/CreatePurchaseForm";
import { PurchaseType } from "@/types/purchase";
import { useCreatePurchaseQuotation } from "@/hooks/usePurchaseQuotations";
import { CreatePurchaseQuotationForm } from "@/components/purchases/forms/CreatePurchaseQuotationForm";
import axios from "axios";

const CreateNewPurchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const typeFromUrl = (searchParams.get("type") as PurchaseType) || "invoice";
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(typeFromUrl);

  const createQuotationMutation = useCreatePurchaseQuotation();

  // Get auth token helper function
  const getAuthToken = () => {
    const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (!authDataRaw) {
      throw new Error("No access token found in localStorage");
    }
    const authData = JSON.parse(authDataRaw);
    const token = authData.access_token;
    if (!token) {
      throw new Error("Access token missing in parsed auth data");
    }
    return token;
  };

  const handleSubmit = async (formData: any) => {
    try {
      console.log("Submitting form data:", formData);

      const baseData = {
        number: Date.now(), // Generate a unique number
        type: formData.type || purchaseType,
        date: formData.date,
        due_date: formData.dueDate,
        status: formData.status || "pending",
        tags: formData.tags || [],
        items: formData.items || [],
        grand_total: formData.grandTotal || 0,
      };

      console.log("Base data:", baseData);

      switch (purchaseType) {
        case "invoice":
          // Handle invoice creation with new API
          const token = getAuthToken();
          
          // Create FormData for multipart request
          const apiFormData = new FormData();
          
          // Add all required fields for invoice
          apiFormData.append('action', 'addNewInvoice');
          apiFormData.append('type', 'Invoice');
          apiFormData.append('date', formData.date);
          apiFormData.append('approver', formData.approver || 'John Doe');
          apiFormData.append('due_date', formData.dueDate);
          apiFormData.append('status', formData.status === 'pending' ? 'Unpaid' : formData.status);
          apiFormData.append('tags', JSON.stringify(formData.tags || []));
          apiFormData.append('items', JSON.stringify(formData.items || []));
          apiFormData.append('tax_calculation_method', 'false');
          apiFormData.append('ppn_percentage', '11');
          apiFormData.append('pph_type', '23');
          apiFormData.append('pph_percentage', '2');
          apiFormData.append('grand_total', (formData.grandTotal || 0).toString());
          apiFormData.append('memo', 'Catatan Add Invoice');
          apiFormData.append('number', formData.number || `INV-${Date.now()}`);
          
          // Add file if provided (attachment_url)
          if (formData.attachmentFile) {
            apiFormData.append('attachment_url', formData.attachmentFile);
          }

          const response = await axios.post(
            'https://pbw-backend-api.vercel.app/api/purchases',
            apiFormData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          if (response.data && !response.data.error) {
            toast.success("Invoice created successfully");
            navigate("/purchases");
            return;
          } else {
            throw new Error(response.data?.message || "Failed to create invoice");
          }
        case "offer": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          apiFormData.append('action', 'addNewOffer');
          apiFormData.append('type', 'Offer');
          apiFormData.append('date', formData.date);
          apiFormData.append('discount_terms', formData.discountTerms || '');
          apiFormData.append('expiry_date', formData.expiryDate || formData.date);
          apiFormData.append('due_date', formData.dueDate || formData.date);

          const normalizedStatus = (formData.status || 'pending')
            .toString()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append('status', normalizedStatus);

          const tagsValue = Array.isArray(formData.tags) ? formData.tags.join(',') : (formData.tags || '');
          apiFormData.append('tags', tagsValue);

          const mappedItems = (formData.items || []).map((it: any) => ({
            item_name: it.name ?? it.item_name ?? '',
            qty: `${it.quantity ?? it.qty ?? 0} ${it.unit ?? 'kg'}`,
            price: it.price ?? 0,
          }));
          apiFormData.append('items', JSON.stringify(mappedItems));

          apiFormData.append('grand_total', (formData.grandTotal || 0).toString());
          apiFormData.append('memo', formData.memo || '');
          apiFormData.append('number', formData.number || String(baseData.number));

          if (formData.attachmentFile) {
            apiFormData.append('attachment_url', formData.attachmentFile);
          }

          const offerResponse = await axios.post(
            'https://pbw-backend-api.vercel.app/api/purchases',
            apiFormData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (offerResponse.data && !offerResponse.data.error) {
            toast.success("Offer created successfully");
            navigate("/purchases");
            return;
          } else {
            throw new Error(offerResponse.data?.message || "Failed to create offer");
          }
        }
        case "order": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          apiFormData.append('action', 'addNewOrder');
          apiFormData.append('type', 'Order');
          apiFormData.append('date', formData.date);
          apiFormData.append('orders_date', formData.orderDate || formData.date);
          apiFormData.append('due_date', formData.dueDate || formData.date);

          const normalizedStatus = (formData.status || 'pending')
            .toString()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append('status', normalizedStatus);

          const tagsValue = Array.isArray(formData.tags) ? formData.tags.join(',') : (formData.tags || '');
          apiFormData.append('tags', tagsValue);

          const mappedItems = (formData.items || []).map((it: any) => ({
            item_name: it.name ?? it.item_name ?? '',
            qty: `${it.quantity ?? it.qty ?? 0} ${it.unit ?? 'kg'}`,
            price: it.price ?? 0,
          }));
          apiFormData.append('items', JSON.stringify(mappedItems));

          apiFormData.append('grand_total', (formData.grandTotal || 0).toString());
          apiFormData.append('memo', formData.memo || '');
          apiFormData.append('number', formData.number || String(baseData.number));

          if (formData.attachmentFile) {
            apiFormData.append('attachment_url', formData.attachmentFile);
          }

          const orderResponse = await axios.post(
            'https://pbw-backend-api.vercel.app/api/purchases',
            apiFormData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (orderResponse.data && !orderResponse.data.error) {
            toast.success("Order created successfully");
            navigate("/purchases");
            return;
          } else {
            throw new Error(orderResponse.data?.message || "Failed to create order");
          }
        }
        case "request": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          apiFormData.append('action', 'addNewRequest');
          apiFormData.append('type', 'Request');
          apiFormData.append('date', formData.date);
          apiFormData.append('requested_by', formData.requestedBy || '');
          apiFormData.append('urgency', formData.urgency || 'Medium');
          apiFormData.append('due_date', formData.dueDate || formData.date);

          const normalizedStatus = (formData.status || 'pending')
            .toString()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append('status', normalizedStatus);

          const tagsValue = Array.isArray(formData.tags) ? formData.tags.join(',') : (formData.tags || '');
          apiFormData.append('tags', tagsValue);

          const mappedItems = (formData.items || []).map((it: any) => ({
            item_name: it.name ?? it.item_name ?? '',
            qty: `${it.quantity ?? it.qty ?? 0} ${it.unit ?? 'kg'}`,
            price: it.price ?? 0,
          }));
          apiFormData.append('items', JSON.stringify(mappedItems));

          apiFormData.append('grand_total', (formData.grandTotal || 0).toString());
          apiFormData.append('memo', formData.memo || '');
          apiFormData.append('number', formData.number || String(baseData.number));

          if (formData.attachmentFile) {
            apiFormData.append('attachment_url', formData.attachmentFile);
          }

          const requestResponse = await axios.post(
            'https://pbw-backend-api.vercel.app/api/purchases',
            apiFormData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (requestResponse.data && !requestResponse.data.error) {
            toast.success("Request created successfully");
            navigate("/purchases");
            return;
          } else {
            throw new Error(requestResponse.data?.message || "Failed to create request");
          }
        }
        case "shipment": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          // Required action and type
          apiFormData.append('action', 'addNewShipment');
          apiFormData.append('type', 'Shipment');

          // Core fields
          apiFormData.append('date', formData.date);
          apiFormData.append('tracking_number', formData.trackingNumber || '');
          apiFormData.append('carrier', formData.carrier || '');
          apiFormData.append('shipping_date', formData.shippingDate || formData.date);
          apiFormData.append('due_date', formData.dueDate || formData.date);

          // Normalize status to Title Case like "Pending"
          const normalizedStatus = (formData.status || 'pending')
            .toString()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append('status', normalizedStatus);

          // Tags should be comma-separated text
          const tagsValue = Array.isArray(formData.tags) ? formData.tags.join(',') : (formData.tags || '');
          apiFormData.append('tags', tagsValue);

          // Map items to expected shape [{ item_name, qty, price }]
          const mappedItems = (formData.items || []).map((it: any) => ({
            item_name: it.name ?? it.item_name ?? '',
            qty: `${it.quantity ?? it.qty ?? 0} ${it.unit ?? 'kg'}`,
            price: it.price ?? 0,
          }));
          apiFormData.append('items', JSON.stringify(mappedItems));

          // Totals and misc
          apiFormData.append('grand_total', (formData.grandTotal || 0).toString());
          apiFormData.append('memo', formData.memo || '');
          apiFormData.append('number', formData.number || String(baseData.number));

          // Optional file
          if (formData.attachmentFile) {
            apiFormData.append('attachment_url', formData.attachmentFile);
          }

          const shipmentResponse = await axios.post(
            'https://pbw-backend-api.vercel.app/api/purchases',
            apiFormData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                // Let axios set the correct multipart boundary
              },
            }
          );

          if (shipmentResponse.data && !shipmentResponse.data.error) {
            toast.success("Shipment created successfully");
            navigate("/purchases");
            return;
          } else {
            throw new Error(shipmentResponse.data?.message || "Failed to create shipment");
          }
        }
        case "quotation":
          await createQuotationMutation.mutateAsync({
            number: formData.number,
            vendor_name: formData.vendorName,
            quotation_date: formData.quotationDate,
            valid_until: formData.validUntil,
            status: formData.status,
            items: formData.items,
            total: formData.total,
            terms: formData.terms,
          });
          break;
      }

      toast.success("Purchase created successfully");
      navigate("/purchases");
    } catch (error) {
      console.error("Error creating purchase:", error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to create purchase";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to create purchase. Please check the console for details.");
      }
    }
  };

  const isLoading = createQuotationMutation.isPending;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header
          title={`Create New ${
            purchaseType === "quotation"
              ? "Purchase Quotation"
              : purchaseType.charAt(0).toUpperCase() + purchaseType.slice(1)
          }`}
          description={
            purchaseType === "invoice"
              ? "Fill out details to create a new purchase invoice"
              : purchaseType === "shipment"
              ? "Create a new shipment record for your purchase"
              : purchaseType === "order"
              ? "Create a new purchase order"
              : purchaseType === "offer"
              ? "Create a new purchase offer"
              : purchaseType === "request"
              ? "Create a new purchase request"
              : "Create a new purchase quotation"
          }
        />

        <div className="p-6">
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