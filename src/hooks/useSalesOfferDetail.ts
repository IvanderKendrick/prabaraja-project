import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface OfferDetailData {
  id: string;
  number: string;
  date?: string;
  offer_date?: string;
  expiry_date?: string;
  due_date?: string;
  status?: string;
  discount_terms?: string;
  items?: any[];
  total?: number;
  grand_total?: number;
  tags?: string[];
  memo?: string;
  terms?: string;
  tax_details?: any;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  attachment_url?: string | string[];
}

const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No auth token in localStorage");
  const parsed = JSON.parse(raw);
  if (!parsed?.access_token) throw new Error("Access token missing");
  return parsed.access_token;
};

export const useSalesOfferDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["sales-offer-detail", id],
    queryFn: async (): Promise<OfferDetailData | null> => {
      if (!id) throw new Error("Offer ID is required");
      try {
        const token = getAuthToken();
        const url = `https://pbw-backend-api.vercel.app/api/sales?action=getOffer&status=&search=${id}`;
        const res = await axios.get<{ data?: OfferDetailData[]; error?: boolean; message?: string }>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.error) throw new Error(res.data.message || "Failed to fetch offer detail");
        if (!res.data?.data || res.data.data.length === 0) return null;
        const offer = res.data.data[0];
        if (offer.tax_details && typeof offer.tax_details === "string") {
          try {
            offer.tax_details = JSON.parse(offer.tax_details);
          } catch (e) {}
        }
        return offer;
      } catch (err: any) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message || err.message);
        throw err;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => failureCount < 2,
  });
};
