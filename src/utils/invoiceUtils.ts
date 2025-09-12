
import { salesData } from "../data/salesData";

// Function to get sales invoice by ID
export const getSalesInvoiceById = (id: string) => {
  return salesData.find(invoice => invoice.id === id);
};

// Generate a unique sales invoice ID
export const generateSalesInvoiceId = () => {
  const sortedData = [...salesData].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  const latestId = sortedData.length > 0 ? parseInt(sortedData[0].id) : 10000;
  return (latestId + 1).toString();
};

// Format date for display (DD/MM/YYYY)
export const formatDateForDisplay = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Parse date string (DD/MM/YYYY) to Date object
export const parseDateString = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};
