import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CreatePurchaseForm } from "@/components/create/CreatePurchaseForm";
import { PurchaseType } from "@/types/purchase";
import axios from "axios";

const CreateNewPurchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const typeFromUrl = (searchParams.get("type") as PurchaseType) || "invoice";
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(typeFromUrl);

  // Get auth token helper function
  const getAuthToken = () => {
    const authDataRaw = localStorage.getItem(
      "sb-xwfkrjtqcqmmpclioakd-auth-token"
    );
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
    setIsLoading(true);
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
        case "invoice": {
          // Handle invoice creation with new API
          const token = getAuthToken();

          // Create FormData for multipart request
          const apiFormData = new FormData();

          // Add all required fields for invoice
          apiFormData.append("action", "addNewInvoice");
          apiFormData.append("type", "Invoice");
          apiFormData.append("date", formData.date);
          apiFormData.append("approver", formData.approver || "");
          apiFormData.append("due_date", formData.dueDate);

          // apiFormData.append(
          //   "status",
          //   formData.status === "pending" ? "Unpaid" : formData.status
          // );

          const normalizedStatus = (formData.status || "pending")
            .toString()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append("status", normalizedStatus);

          // apiFormData.append("tags", JSON.stringify(formData.tags || []));

          // Tags
          const tagsValue = Array.isArray(formData.tags)
            ? formData.tags.join(",")
            : formData.tags || "";
          apiFormData.append("tags", `{${tagsValue}}`);

          // apiFormData.append("items", JSON.stringify(formData.items || []));

          // Map items with full support (discount, coa, return, memo, etc.)
          const mappedItems = (formData.items || []).map((it: any) => {
            const itemData: any = {
              coa: it.coaLabel ? it.coaLabel.split(" - ")[0] : "",
              item_name: it.name ?? it.item_name ?? "", // nama item
              sku: it.sku ?? "", // kode SKU
              qty: it.quantity ?? it.qty ?? 0, // jumlah
              unit: it.unit ?? "pcs", // satuan
              price: it.price ?? 0, // harga
              return_unit: it.return ?? it.return_unit ?? 0, // jumlah retur (default 0)
              memo: it.memo ?? "-", // catatan per item
              addToStock: it.stock ?? it.addToStock ?? false, // status tambah ke stok
            };

            // Handle discount (percentage or rupiah)
            if (it.discountPercent && it.discountPercent > 0) {
              itemData.disc_item = it.discountPercent;
              itemData.disc_item_type = "percentage";
            } else if (it.discountPrice && it.discountPrice > 0) {
              itemData.disc_item = it.discountPrice;
              itemData.disc_item_type = "rupiah";
            }

            return itemData;
          });

          apiFormData.append("items", JSON.stringify(mappedItems));

          // Tax details
          apiFormData.append(
            "tax_method",
            formData.taxCalculationMethod
              ? "After Calculate"
              : "Before Calculate"
          );

          apiFormData.append(
            "ppn_percentage",
            (formData.ppnPercentage || 11).toString()
          );
          apiFormData.append(
            "pph_percentage",
            // (formData.pphPercentage || 2).toString()
            formData.pphPercentage.toString()
          );
          apiFormData.append(
            "pph_type",
            (formData.pphType
              ? formData.pphType.replace(/[^\d]+/, "") || formData.pphType // ambil angka jika ada, kalau tidak, pakai aslinya
              : "23"
            ).toString()
          );

          // Totals
          apiFormData.append(
            "grand_total",
            (formData.grandTotal || 0).toString()
          );

          apiFormData.append("memo", formData.memo || "");

          apiFormData.append("number", formData.number);

          // Add file if provided (attachment_url)
          // if (formData.attachmentFile) {
          //   apiFormData.append("attachment_url", formData.attachmentFile);
          // }

          // Vendor information
          apiFormData.append("vendor_name", formData.vendorName || "");
          apiFormData.append("vendor_address", formData.vendorAddress || "");
          apiFormData.append("vendor_phone", formData.vendorPhone || "");

          // apiFormData.append("vendor_COA", formData.vendorCoaAccountId || "");
          apiFormData.append(
            "vendor_COA",
            formData.vendorCoaLabel?.split(" - ")[0] || ""
          );

          apiFormData.append("terms", formData.terms || "");
          apiFormData.append("freight_in", formData.freightIn || "");
          apiFormData.append("insurance", formData.insuranceCost || "");

          apiFormData.append("dpp", (formData.dpp || 0).toString());
          apiFormData.append("ppn", (formData.ppn || 0).toString());
          apiFormData.append("pph", (formData.pph || 0).toString());

          apiFormData.append(
            "total",
            (formData.subtotalWithCosts || 0).toString()
          );

          // Optional file
          if (formData.attachmentFiles && formData.attachmentFiles.length > 0) {
            apiFormData.append("attachment_url", formData.attachmentFiles[0]);
          }

          const response = await axios.post(
            "https://pbw-backend-api.vercel.app/api/purchases",
            apiFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data && !response.data.error) {
            toast.success("Invoice created successfully");
            navigate("/purchases/invoices");
            return;
          } else {
            throw new Error(
              response.data?.message || "Failed to create invoice"
            );
          }
        }
        case "offer": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          apiFormData.append("action", "addNewOffer");
          apiFormData.append("type", "Offer");
          apiFormData.append("date", formData.date);
          apiFormData.append("discount_terms", formData.discountTerms || "");
          apiFormData.append(
            "expiry_date",
            formData.expiryDate || formData.date
          );
          apiFormData.append("due_date", formData.dueDate || formData.date);

          const normalizedStatus = (formData.status || "pending")
            .toString()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append("status", normalizedStatus);

          const tagsValue = Array.isArray(formData.tags)
            ? formData.tags.join(",")
            : formData.tags || "";
          apiFormData.append("tags", tagsValue);

          const mappedItems = (formData.items || []).map((it: any) => ({
            item_name: it.name ?? it.item_name ?? "",
            qty: `${it.quantity ?? it.qty ?? 0} ${it.unit ?? "kg"}`,
            price: it.price ?? 0,
          }));
          apiFormData.append("items", JSON.stringify(mappedItems));

          apiFormData.append(
            "grand_total",
            (formData.grandTotal || 0).toString()
          );
          apiFormData.append("memo", formData.memo || "");
          apiFormData.append(
            "number",
            formData.number || String(baseData.number)
          );

          if (formData.attachmentFile) {
            apiFormData.append("attachment_url", formData.attachmentFile);
          }

          const offerResponse = await axios.post(
            "https://pbw-backend-api.vercel.app/api/purchases",
            apiFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (offerResponse.data && !offerResponse.data.error) {
            toast.success("Offer created successfully");
            navigate("/purchases/offers");
            return;
          } else {
            throw new Error(
              offerResponse.data?.message || "Failed to create offer"
            );
          }
        }
        case "order": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          apiFormData.append("action", "addNewOrder");
          apiFormData.append("type", "Order");
          apiFormData.append("date", formData.date);
          apiFormData.append(
            "orders_date",
            formData.orderDate || formData.date
          );
          apiFormData.append("due_date", formData.dueDate || formData.date);

          const normalizedStatus = (formData.status || "pending")
            .toString()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append("status", normalizedStatus);

          const tagsValue = Array.isArray(formData.tags)
            ? formData.tags.join(",")
            : formData.tags || "";
          apiFormData.append("tags", tagsValue);

          const mappedItems = (formData.items || []).map((it: any) => ({
            item_name: it.name ?? it.item_name ?? "",
            qty: `${it.quantity ?? it.qty ?? 0} ${it.unit ?? "kg"}`,
            price: it.price ?? 0,
          }));
          apiFormData.append("items", JSON.stringify(mappedItems));

          apiFormData.append(
            "grand_total",
            (formData.grandTotal || 0).toString()
          );
          apiFormData.append("memo", formData.memo || "");
          apiFormData.append(
            "number",
            formData.number || String(baseData.number)
          );

          if (formData.attachmentFile) {
            apiFormData.append("attachment_url", formData.attachmentFile);
          }

          const orderResponse = await axios.post(
            "https://pbw-backend-api.vercel.app/api/purchases",
            apiFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (orderResponse.data && !orderResponse.data.error) {
            toast.success("Order created successfully");
            navigate("/purchases/orders");
            return;
          } else {
            throw new Error(
              orderResponse.data?.message || "Failed to create order"
            );
          }
        }
        case "request": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          apiFormData.append("action", "addNewRequest");
          apiFormData.append("type", "Request");
          apiFormData.append("date", formData.date);
          apiFormData.append("requested_by", formData.requestedBy || "");
          apiFormData.append("urgency", formData.urgency || "");
          apiFormData.append("due_date", formData.dueDate);

          const normalizedStatus = (formData.status || "pending")
            .toString()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append("status", normalizedStatus);

          // Tags
          const tagsValue = Array.isArray(formData.tags)
            ? formData.tags.join(",")
            : formData.tags || "";
          apiFormData.append("tags", `${tagsValue}`);

          // Map items with full support (discount, coa, return, memo, etc.)
          const mappedItems = (formData.items || []).map((it: any) => {
            const itemData: any = {
              item_name: it.name ?? it.item_name ?? "", // nama item
              sku: it.sku ?? "", // kode SKU
              qty: it.quantity ?? it.qty ?? 0, // jumlah
              unit: it.unit ?? "pcs", // satuan
              price: it.price ?? 0, // harga
              return_unit: it.return ?? it.return_unit ?? 0, // jumlah retur (default 0)
              memo: it.memo ?? "-", // catatan per item
            };

            // Handle discount (percentage or rupiah)
            if (it.discountPercent && it.discountPercent > 0) {
              itemData.disc_item = it.discountPercent;
              itemData.disc_item_type = "percentage";
            } else if (it.discountPrice && it.discountPrice > 0) {
              itemData.disc_item = it.discountPrice;
              itemData.disc_item_type = "rupiah";
            }

            return itemData;
          });

          apiFormData.append("items", JSON.stringify(mappedItems));

          apiFormData.append(
            "grand_total",
            (formData.grandTotal || 0).toString()
          );
          apiFormData.append("memo", formData.memo || "");
          apiFormData.append("number", formData.number);

          // Vendor information
          apiFormData.append("vendor_name", formData.vendorName || "");
          apiFormData.append("vendor_address", formData.vendorAddress || "");
          apiFormData.append("vendor_phone", formData.vendorPhone || "");

          // if (formData.attachmentFile) {
          //   apiFormData.append("attachment_url", formData.attachmentFile);
          // }

          // Optional file
          if (formData.attachmentFiles && formData.attachmentFiles.length > 0) {
            apiFormData.append("attachment_url", formData.attachmentFiles[0]);
          }

          apiFormData.append("installment_amount", formData.installmentAmount);

          // Tax details
          apiFormData.append(
            "tax_method",
            formData.taxCalculationMethod
              ? "After Calculate"
              : "Before Calculate"
          );

          apiFormData.append(
            "ppn_percentage",
            (formData.ppnPercentage || 11).toString()
          );
          // apiFormData.append(
          //   "pph_percentage",
          //   (formData.pphPercentage || 2).toString()
          // );

          apiFormData.append(
            "pph_percentage",
            formData.pphPercentage.toString()
          );

          apiFormData.append(
            "pph_type",
            (formData.pphType
              ? formData.pphType.replace(/[^\d]+/, "") || formData.pphType // ambil angka jika ada, kalau tidak, pakai aslinya
              : "23"
            ).toString()
          );

          apiFormData.append("dpp", (formData.dpp || 0).toString());
          apiFormData.append("ppn", (formData.ppn || 0).toString());
          apiFormData.append("pph", (formData.pph || 0).toString());

          apiFormData.append(
            "total",
            (formData.subtotalWithCosts || 0).toString()
          );

          const requestResponse = await axios.post(
            "https://pbw-backend-api.vercel.app/api/purchases",
            apiFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (requestResponse.data && !requestResponse.data.error) {
            toast.success("Request created successfully");
            navigate("/purchases/requests");
            return;
          } else {
            throw new Error(
              requestResponse.data?.message || "Failed to create request"
            );
          }
        }
        case "shipment": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          // Required action and type
          apiFormData.append("action", "addNewShipment");
          apiFormData.append("type", "Shipment");

          // Core fields
          apiFormData.append("date", formData.date);
          apiFormData.append("tracking_number", formData.trackingNumber || "");
          apiFormData.append("carrier", formData.carrier || "");
          apiFormData.append("shipping_date", formData.shippingDate);
          apiFormData.append("due_date", formData.dueDate);

          // Normalize status
          const normalizedStatus = (formData.status || "pending")
            .toString()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append("status", normalizedStatus);

          /// Tags
          const tagsValue = Array.isArray(formData.tags)
            ? formData.tags.join(",")
            : formData.tags || "";
          apiFormData.append("tags", tagsValue);

          // Map items with full support (discount, coa, return, memo, etc.)
          const mappedItems = (formData.items || []).map((it: any) => {
            const itemData: any = {
              item_name: it.name ?? it.item_name ?? "", // nama item
              sku: it.sku ?? "", // kode SKU
              qty: it.quantity ?? it.qty ?? 0, // jumlah
              unit: it.unit ?? "pcs", // satuan
              price: it.price ?? 0, // harga
              return_unit: it.return ?? it.return_unit ?? 0, // jumlah retur (default 0)
              memo: it.memo ?? "-", // catatan per item
            };

            // Handle discount (percentage or rupiah)
            if (it.discountPercent && it.discountPercent > 0) {
              itemData.disc_item = it.discountPercent;
              itemData.disc_item_type = "percentage";
            } else if (it.discountPrice && it.discountPrice > 0) {
              itemData.disc_item = it.discountPrice;
              itemData.disc_item_type = "rupiah";
            }

            return itemData;
          });

          apiFormData.append("items", JSON.stringify(mappedItems));

          // Totals
          apiFormData.append(
            "grand_total",
            (formData.grandTotal || 0).toString()
          );
          apiFormData.append("memo", formData.memo || "");
          apiFormData.append("number", formData.number);

          // Vendor information
          apiFormData.append("vendor_name", formData.vendorName || "");
          apiFormData.append("vendor_address", formData.vendorAddress || "");
          apiFormData.append("vendor_phone", formData.vendorPhone || "");

          // Optional file
          // if (formData.attachmentFile) {
          //   apiFormData.append("attachment_url", formData.attachmentFile);
          // }

          // Optional file
          if (formData.attachmentFiles && formData.attachmentFiles.length > 0) {
            apiFormData.append("attachment_url", formData.attachmentFiles[0]);
          }

          // Tax details
          apiFormData.append(
            "tax_method",
            formData.taxCalculationMethod
              ? "After Calculate"
              : "Before Calculate"
          );

          apiFormData.append(
            "ppn_percentage",
            (formData.ppnPercentage || 11).toString()
          );
          apiFormData.append(
            "pph_percentage",
            formData.pphPercentage.toString()
          );
          // apiFormData.append(
          //   "pph_percentage",
          //   (formData.pphPercentage || 2).toString()
          // );
          apiFormData.append(
            "pph_type",
            (formData.pphType
              ? formData.pphType.replace(/[^\d]+/, "") || formData.pphType // ambil angka jika ada, kalau tidak, pakai aslinya
              : "23"
            ).toString()
          );

          apiFormData.append("dpp", (formData.dpp || 0).toString());
          apiFormData.append("ppn", (formData.ppn || 0).toString());
          apiFormData.append("pph", (formData.pph || 0).toString());

          apiFormData.append(
            "total",
            (formData.subtotalWithCosts || 0).toString()
          );

          const shipmentResponse = await axios.post(
            "https://pbw-backend-api.vercel.app/api/purchases",
            apiFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                // Let axios set the correct multipart boundary
              },
            }
          );

          if (shipmentResponse.data && !shipmentResponse.data.error) {
            toast.success("Shipment created successfully");
            navigate("/purchases/shipments");
            return;
          } else {
            throw new Error(
              shipmentResponse.data?.message || "Failed to create shipment"
            );
          }
        }
        case "quotation": {
          const token = getAuthToken();
          const apiFormData = new FormData();

          // Required action and type
          apiFormData.append("action", "addNewQuotation");
          apiFormData.append("type", "Quotation");
          apiFormData.append(
            "quotation_date",
            formData.quotationDate || formData.date
          );
          apiFormData.append("due_date", formData.dueDate);

          // Normalize status
          const normalizedStatus = (formData.status || "pending")
            .toString()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          apiFormData.append("status", normalizedStatus);

          // Tags
          const tagsValue = Array.isArray(formData.tags)
            ? formData.tags.join(",")
            : formData.tags || "";
          apiFormData.append("tags", tagsValue);

          // Map items with discount support
          const mappedItems = (formData.items || []).map((it: any) => {
            const itemData: any = {
              item_name: it.name ?? it.item_name ?? "",
              qty: it.quantity ?? it.qty ?? 0,
              unit: it.unit ?? "kg",
              price: it.price ?? 0,
            };

            // Add discount if exists
            if (it.discountPercent && it.discountPercent > 0) {
              itemData.disc_item = it.discountPercent;
              itemData.disc_item_type = "percentage";
            } else if (it.discountPrice && it.discountPrice > 0) {
              itemData.disc_item = it.discountPrice;
              itemData.disc_item_type = "rupiah";
            }

            return itemData;
          });
          apiFormData.append("items", JSON.stringify(mappedItems));

          // Totals
          apiFormData.append(
            "grand_total",
            (formData.grandTotal || 0).toString()
          );
          apiFormData.append("total", (formData.grandTotal || 0).toString());
          apiFormData.append("memo", formData.memo || "");

          // Vendor information
          apiFormData.append("vendor_name", formData.vendorName || "");
          apiFormData.append("vendor_address", formData.vendorAddress || "");
          apiFormData.append("vendor_phone", formData.vendorPhone || "");

          // Quotation specific
          apiFormData.append(
            "start_date",
            formData.quotationDate || formData.date
          );
          apiFormData.append("valid_until", formData.validUntil || "");
          apiFormData.append("terms", formData.terms || "");
          apiFormData.append("number", formData.number);

          // Tax details
          // NOTED!
          apiFormData.append(
            "tax_method",
            formData.taxCalculationMethod
              ? "After Calculate"
              : "Before Calculate"
          );
          apiFormData.append("dpp", (formData.dpp || 0).toString());
          apiFormData.append("ppn", (formData.ppn || 0).toString());
          apiFormData.append("pph", (formData.pph || 0).toString());
          apiFormData.append(
            "ppn_percentage",
            (formData.ppnPercentage || 11).toString()
          );
          apiFormData.append(
            "pph_percentage",
            formData.pphPercentage.toString()
          );
          // apiFormData.append(
          //   "pph_percentage",
          //   (formData.pphPercentage || 2).toString()
          // );
          apiFormData.append(
            "pph_type",
            (formData.pphType
              ? formData.pphType.replace(/[^\d]+/, "") || formData.pphType // ambil angka jika ada, kalau tidak, pakai aslinya
              : "23"
            ).toString()
          );

          // Optional file
          if (formData.attachmentFiles && formData.attachmentFiles.length > 0) {
            apiFormData.append("attachment_url", formData.attachmentFiles[0]);
          }

          const quotationResponse = await axios.post(
            "https://pbw-backend-api.vercel.app/api/purchases",
            apiFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (quotationResponse.data && !quotationResponse.data.error) {
            toast.success("Quotation created successfully");
            navigate("/purchases/quotations");
            return;
          } else {
            throw new Error(
              quotationResponse.data?.message || "Failed to create quotation"
            );
          }
        }
      }

      toast.success("Purchase created successfully");
      navigate("/purchases");
    } catch (error) {
      console.error("Error creating purchase:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create purchase";
        toast.error(errorMessage);
      } else {
        toast.error(
          "Failed to create purchase. Please check the console for details."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

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
          <CreatePurchaseForm
            purchaseType={purchaseType}
            setPurchaseType={setPurchaseType}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateNewPurchase;
