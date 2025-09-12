
import { PurchaseType } from "@/types/purchase";

export const getTypeTitle = (purchaseType: PurchaseType): string => {
  switch (purchaseType) {
    case "invoice": return "Invoice";
    case "shipment": return "Shipment";
    case "order": return "Order";
    case "offer": return "Offer";
    case "request": return "Request";
    case "quotation": return "Quotation";
  }
};

export const generatePurchaseNumber = (type: PurchaseType): string => {
  const prefix = 
    type === "invoice" ? "INV-" :
    type === "shipment" ? "SH-" :
    type === "order" ? "ORD-" :
    type === "offer" ? "OFR-" :
    type === "quotation" ? "QUO-" : "REQ-";
  return `${prefix}${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
};

export const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const calculateTotal = (items: { quantity: number; price: number }[]): number => {
  return items.reduce((total, item) => total + (item.quantity * item.price), 0);
};
