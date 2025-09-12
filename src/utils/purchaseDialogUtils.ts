
import { PurchasePriority, PurchaseStatus, PurchaseType } from "@/types/purchase";

/**
 * Generates a default purchase number based on the type
 */
export const generateDefaultPurchaseNumber = (type: string): string => {
  const prefix = type === "invoice" ? "INV-" :
                type === "shipment" ? "SH-" :
                type === "order" ? "ORD-" :
                type === "offer" ? "OFR-" : "REQ-";
  return `${prefix}${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
};

/**
 * Get the display label for a purchase type
 */
export const getPurchaseTypeLabel = (type: PurchaseType): string => {
  const typeLabels = {
    invoice: "Invoice",
    shipment: "Shipment",
    order: "Order",
    offer: "Offer",
    request: "Request"
  };
  
  return typeLabels[type];
};

/**
 * Get the initial form data for a purchase dialog
 */
export const getInitialFormData = (defaultType: PurchaseType) => {
  // Common fields for all purchase types
  const commonFields = {
    date: new Date().toISOString().split('T')[0],
    number: generateDefaultPurchaseNumber(defaultType),
    approver: "",
    dueDate: "",
    status: "pending" as PurchaseStatus,
    itemCount: 0,
    priority: "Medium" as PurchasePriority,
    tags: [""],
    type: defaultType,
  };

  // Type-specific fields
  switch (defaultType) {
    case "shipment":
      return {
        ...commonFields,
        trackingNumber: "",
        carrier: "",
        shippingDate: new Date().toISOString().split('T')[0],
      };
    case "order":
      return {
        ...commonFields,
        orderDate: new Date().toISOString().split('T')[0],
      };
    case "offer":
      return {
        ...commonFields,
        discountTerms: "",
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // Default 1 month expiry
      };
    case "request":
      return {
        ...commonFields,
        requestedBy: "",
        urgency: "Medium",
      };
    default:
      return commonFields;
  }
};
