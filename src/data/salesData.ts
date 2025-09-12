
export interface SalesData {
  id: string;
  date: string;
  number: string;
  customer: string;
  customerId?: number;
  dueDate: string;
  status: string;
  total: string;
  type: "invoice" | "order" | "quotation"; // Added type field
}

export const salesData: SalesData[] = [
  // Paid examples (5) - Invoice type
  {
    id: "10005",
    date: "18/02/2025",
    number: "Sales Invoice #10005",
    customer: "AABVCDD",
    customerId: 1,
    dueDate: "18/02/2025",
    status: "Paid",
    total: "Rp 13.440",
    type: "invoice"
  },
  {
    id: "10004",
    date: "18/02/2025",
    number: "Sales Invoice #10004",
    customer: "AABVCDD",
    customerId: 1,
    dueDate: "18/02/2025",
    status: "Paid",
    total: "Rp 133.440",
    type: "invoice"
  },
  {
    id: "10003",
    date: "14/02/2025",
    number: "Sales Invoice #10003",
    customer: "Nanda goaw putra",
    customerId: 1,
    dueDate: "16/03/2025",
    status: "Paid",
    total: "Rp 106.560",
    type: "invoice"
  },
  {
    id: "10002",
    date: "10/02/2025",
    number: "Sales Invoice #10002",
    customer: "Sutejo Enterprises",
    customerId: 1,
    dueDate: "10/02/2025",
    status: "Paid",
    total: "Rp 245.000",
    type: "invoice"
  },
  {
    id: "10001",
    date: "05/02/2025",
    number: "Sales Invoice #10001",
    customer: "Pak Budi Store",
    customerId: 1,
    dueDate: "05/02/2025",
    status: "Paid",
    total: "Rp 89.750",
    type: "invoice"
  },
  
  // Unpaid examples (5) - Invoice type
  {
    id: "10006",
    date: "22/02/2025",
    number: "Sales Invoice #10006",
    customer: "Toko Makmur",
    customerId: 1,
    dueDate: "10/03/2025",
    status: "Unpaid",
    total: "Rp 320.500",
    type: "invoice"
  },
  {
    id: "10007",
    date: "23/02/2025",
    number: "Sales Invoice #10007",
    customer: "CV Berkah",
    customerId: 2,
    dueDate: "15/03/2025",
    status: "Unpaid",
    total: "Rp 175.200",
    type: "invoice"
  },
  {
    id: "10008",
    date: "25/02/2025",
    number: "Sales Invoice #10008",
    customer: "PT Maju Jaya",
    customerId: 1,
    dueDate: "25/03/2025",
    status: "Unpaid",
    total: "Rp 425.750",
    type: "invoice"
  },
  {
    id: "10009",
    date: "26/02/2025",
    number: "Sales Invoice #10009",
    customer: "Ibu Sari Catering",
    customerId: 1,
    dueDate: "26/03/2025",
    status: "Unpaid",
    total: "Rp 92.800",
    type: "invoice"
  },
  {
    id: "10010",
    date: "28/02/2025",
    number: "Sales Invoice #10010",
    customer: "Warung Padang",
    customerId: 1,
    dueDate: "28/03/2025",
    status: "Unpaid",
    total: "Rp 65.000",
    type: "invoice"
  },
  
  // Late Payment examples (5) - Order type
  {
    id: "9995",
    date: "10/01/2025",
    number: "Order #9995",
    customer: "Supermarket Indah",
    customerId: 1,
    dueDate: "10/02/2025",
    status: "Late Payment",
    total: "Rp 456.000",
    type: "order"
  },
  {
    id: "9996",
    date: "15/01/2025",
    number: "Order #9996",
    customer: "Restoran Sedap",
    customerId: 1,
    dueDate: "15/02/2025",
    status: "Late Payment",
    total: "Rp 215.700",
    type: "order"
  },
  {
    id: "9997",
    date: "18/01/2025",
    number: "Order #9997",
    customer: "Toko Elektronik",
    customerId: 1,
    dueDate: "18/02/2025",
    status: "Late Payment",
    total: "Rp 650.250",
    type: "order"
  },
  {
    id: "9998",
    date: "20/01/2025",
    number: "Order #9998",
    customer: "Apotek Sehat",
    customerId: 1,
    dueDate: "20/02/2025",
    status: "Late Payment",
    total: "Rp 125.400",
    type: "order"
  },
  {
    id: "9999",
    date: "25/01/2025",
    number: "Order #9999",
    customer: "PT Textile Indonesia",
    customerId: 1,
    dueDate: "25/02/2025",
    status: "Late Payment",
    total: "Rp 875.000",
    type: "order"
  },
  
  // Awaiting Payment examples (5) - Quotation type
  {
    id: "10011",
    date: "01/03/2025",
    number: "Quotation #10011",
    customer: "Hotel Merdeka",
    customerId: 1,
    dueDate: "15/03/2025",
    status: "Awaiting Payment",
    total: "Rp 520.000",
    type: "quotation"
  },
  {
    id: "10012",
    date: "02/03/2025",
    number: "Quotation #10012",
    customer: "Toko Bangunan Jaya",
    customerId: 1,
    dueDate: "16/03/2025",
    status: "Awaiting Payment",
    total: "Rp 327.500",
    type: "quotation"
  },
  {
    id: "10013",
    date: "03/03/2025",
    number: "Quotation #10013",
    customer: "Bengkel Motor Cepat",
    customerId: 1,
    dueDate: "17/03/2025",
    status: "Awaiting Payment",
    total: "Rp 85.300",
    type: "quotation"
  },
  {
    id: "10014",
    date: "04/03/2025",
    number: "Quotation #10014",
    customer: "Salon Cantik",
    customerId: 1,
    dueDate: "18/03/2025",
    status: "Awaiting Payment",
    total: "Rp 142.500",
    type: "quotation"
  },
  {
    id: "10015",
    date: "05/03/2025",
    number: "Quotation #10015",
    customer: "Klinik Hewan",
    customerId: 1,
    dueDate: "19/03/2025",
    status: "Awaiting Payment",
    total: "Rp 275.800",
    type: "quotation"
  }
];
