
// src/types/purchase.ts
export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  // New discount fields per item
  discountPercent?: number; // 0-100
  discountPrice?: number; // absolute nominal discount
  // New checkbox fields
  stock?: boolean; // Stock checkbox
  return?: number; // Return checkbox
  // Additional fields
  sku?: string;
  memo?: string;
  coaAccountId?: string; // Selected COA account ID/code
  coaLabel?: string; // Human-readable label for display
}

export type PurchaseType = "invoice" | "shipment" | "order" | "offer" | "request" | "quotation";
export type PurchaseStatus = "pending" | "completed" | "cancelled"  | "Half-paid";
export type PurchasePriority = "High" | "Medium" | "Low";

// Base interface with COMMON fields
interface BasePurchase {
  id: string;
  date: Date;
  number: string;
  approver: string;
  tags: string[];
  type: PurchaseType;
  items: PurchaseItem[];
  amount: number;
  itemCount: number;
  // Add common fields that were causing issues
  dueDate?: Date;
  priority?: PurchasePriority;
}

// Category-specific interfaces
export interface InvoicePurchase extends BasePurchase {
  type: "invoice";
  dueDate: Date; // Required for invoice type
  paidAmount?: number;
  status: PurchaseStatus;
}

export interface ShipmentPurchase extends BasePurchase {
  type: "shipment";
  trackingNumber: string;
  carrier: string;
  shippingDate: Date;
  status: PurchaseStatus;
}

export interface OrderPurchase extends BasePurchase {
  type: "order";
  orderDate: Date;
  orderedBy: string;
  urgency: PurchasePriority;
  discountTerms?: string;
  installmentAmount: number;
}

export interface OfferPurchase extends BasePurchase {
  type: "offer";
  vendorName: string;
  startDate: Date;
  expiryDate: Date;
  discountTerms: string;
}

export interface RequestPurchase extends BasePurchase {
  type: "request";
  requestedBy: string;
  urgency: PurchasePriority;
  status: PurchaseStatus;
}

export interface QuotationPurchase extends BasePurchase {
  type: "quotation";
  vendorName: string;
  quotationDate: Date;
  startDate: Date;
  validUntil: Date;
  terms?: string;
  status: PurchaseStatus;
}

// Union type for all purchases
export type Purchase = 
  | InvoicePurchase 
  | ShipmentPurchase 
  | OrderPurchase 
  | OfferPurchase 
  | RequestPurchase
  | QuotationPurchase;

// Type guards
export const isInvoice = (p: Purchase): p is InvoicePurchase => p.type === "invoice";
export const isShipment = (p: Purchase): p is ShipmentPurchase => p.type === "shipment";
export const isOrder = (p: Purchase): p is OrderPurchase => p.type === "order";
export const isOffer = (p: Purchase): p is OfferPurchase => p.type === "offer";
export const isRequest = (p: Purchase): p is RequestPurchase => p.type === "request";
export const isQuotation = (p: Purchase): p is QuotationPurchase => p.type === "quotation";

// Local storage key
export const PURCHASES_STORAGE_KEY = "purchases";

// Transaction type for backward compatibility
export interface Transaction extends BasePurchase {
  paidAmount?: number;
  dueDate?: Date | null;
}
