import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface InvoiceDetailData {
  id: string;
  number: string;
  invoice_date?: string;
  due_date?: string;
  status?: string;
  customer_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  items?: any[];
  tax_details?: any;
  total?: number;
  grand_total?: number;
  memo?: string;
  terms?: string;
  attachment_url?: string | string[];
}

const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No auth token in localStorage");
  const parsed = JSON.parse(raw);
  if (!parsed?.access_token) throw new Error("Access token missing");
  return parsed.access_token;
};

export const useSalesInvoiceDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["sales-invoice-detail", id],
    queryFn: async (): Promise<InvoiceDetailData | null> => {
      if (!id) throw new Error("Invoice ID is required");
      try {
        const token = getAuthToken();
        // Default to production backend; allow override via VITE_API_BASE_URL
        const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "https://pbw-backend-api.vercel.app";
        const basePath = apiBase.replace(/\/+$/, "");
        const url = `${basePath}/api/sales?action=getInvoice&status=&search=${id}`;
        const res = await axios.get<{ data?: InvoiceDetailData[]; error?: boolean; message?: string }>(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (res.data?.error) throw new Error(res.data.message || "Failed to fetch invoice detail");
        if (!res.data?.data || res.data.data.length === 0) return null;
        const invoice = res.data.data[0];
        if (invoice.tax_details && typeof invoice.tax_details === "string") {
          try {
            invoice.tax_details = JSON.parse(invoice.tax_details);
          } catch (e) {}
        }
        return invoice;
      } catch (err: any) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message || err.message);
        throw err;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => failureCount < 2,
  });
};

export default useSalesInvoiceDetail;
