import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface QuotationDetailData {
  id: string;
  number: string;
  quotation_date: string;
  valid_until: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  status: string;
  items?: Array<any>;
  terms?: string;
  memo?: string;
  tax_details?: any;
  total: number;
  grand_total: number;
  attachment_url?: string | string[];
}

interface QuotationDetailResponse {
  data?: QuotationDetailData[];
  error?: boolean;
  message?: string;
}

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!authDataRaw) throw new Error("No access token found in localStorage");
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) throw new Error("Access token missing in parsed auth data");
  return token;
};

export const useSalesQuotationDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["sales-quotation-detail", id],
    queryFn: async (): Promise<QuotationDetailData | null> => {
      if (!id) throw new Error("Quotation ID is required");

      try {
        const token = getAuthToken();
        const url = `https://pbw-backend-api.vercel.app/api/sales?action=getQuotation&status=&search=${id}`;
        const response = await axios.get<QuotationDetailResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.error) {
          throw new Error(response.data.message || "Failed to fetch quotation detail");
        }

        if (!response.data?.data || response.data.data.length === 0) {
          return null;
        }

        const quotationData = response.data.data[0];

        if (quotationData.tax_details && typeof quotationData.tax_details === "string") {
          try {
            quotationData.tax_details = JSON.parse(quotationData.tax_details);
          } catch (e) {
            // ignore parse error
          }
        }

        return quotationData;
      } catch (error: any) {
        console.error("Error fetching sales quotation detail:", error);
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || error.message || "Failed to fetch quotation detail");
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("not found")) return false;
      return failureCount < 3;
    },
  });
};
