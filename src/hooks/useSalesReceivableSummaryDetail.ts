import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ReceivableSummaryData {
  id: string;
  number?: string;
  date?: string;
  due_date?: string;
  status?: string;
  customer_name?: string;
  items?: any[];
  total?: number;
  grand_total?: number;
  tax_details?: any;
  notes?: string;
}

const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No auth token in localStorage");
  const parsed = JSON.parse(raw);
  if (!parsed?.access_token) throw new Error("Access token missing");
  return parsed.access_token;
};

export const useSalesReceivableSummaryDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["sales-receivable-summary-detail", id],
    queryFn: async (): Promise<ReceivableSummaryData | null> => {
      if (!id) throw new Error("Receivable Summary ID is required");
      try {
        const token = getAuthToken();
        const url = `https://pbw-backend-api.vercel.app/api/sales?action=getReceivableSummary&status=&search=${id}`;
        const res = await axios.get<{ data?: ReceivableSummaryData[]; error?: boolean; message?: string }>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.error) throw new Error(res.data.message || "Failed to fetch receivable summary detail");
        if (!res.data?.data || res.data.data.length === 0) return null;
        const data = res.data.data[0];
        if (data.tax_details && typeof data.tax_details === "string") {
          try {
            data.tax_details = JSON.parse(data.tax_details);
          } catch (e) {}
        }
        return data;
      } catch (err: any) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message || err.message);
        throw err;
      }
    },
    enabled: !!id,
    retry: (failureCount) => failureCount < 2,
  });
};

export default useSalesReceivableSummaryDetail;
