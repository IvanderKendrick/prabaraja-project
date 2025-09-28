
import { salesData } from "../data/salesData";

// Function to get the latest invoice number from the actual sales data
export const getLatestInvoiceNumber = () => {
  const sortedData = [...salesData].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  return sortedData.length > 0 ? sortedData[0].id : "10000";
};

// Function to format price with Indonesian locale
export const formatPriceWithSeparator = (price?: number | null): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '-'; // Fallback for invalid input
  }

  return price.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Find a contact ID by customer name, or create a mapping (default to 1 for now)
export const findContactIdByName = (customerName: string): number => {
  // This is a simplified function that would normally query the contacts database
  // For now, we'll return 1 as default since we have limited contacts
  if (customerName === "PT Maju Jaya") return 1;
  if (customerName === "CV Sukses Makmur") return 2;
  if (customerName === "Budi Santoso") return 3;
  
  // Default to the first contact (PT Maju Jaya)
  return 1;
};
