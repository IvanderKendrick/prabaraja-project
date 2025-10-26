import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface OfferDetailData {
  id: string;
  number: string;
  quotation_date: string;
  valid_until: string;
  vendor_name: string;
  vendor_address?: string;
  vendor_phone?: string;
  status: string;
  items: Array<{
    item_name?: string;
    name?: string;
    description?: string;
    qty?: number;
    quantity?: number;
    qty_per_unit?: number;
    price?: number;
    unit_price?: number;
    price_per_unit?: number;
    discount?: number;
    disc_item?: number;
    disc_item_type?: string;
  }>;
  terms?: string;
  memo?: string;
  tax_details?: string | object;
  total: number;
  grand_total: number;
  attachment_url?: string;
  created_at?: string;
  updated_at?: string;
  pph_percentage?: number;
  ppn_percentage?: number;
  pph_type?: string;
}

interface OfferDetailResponse {
  data?: OfferDetailData[];
  error?: boolean;
  message?: string;
}

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem(
    "sb-xwfkrjtqcqmmpclioakd-auth-token"
  );
  if (!authDataRaw) throw new Error("No access token found in localStorage");
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) throw new Error("Access token missing in parsed auth data");
  return token;
};

export const usePurchaseOffersDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["purchase-offer-detail", id],
    queryFn: async (): Promise<OfferDetailData | null> => {
      if (!id) throw new Error("Offer ID is required");

      try {
        const token = getAuthToken();
        const response = await axios.get<OfferDetailResponse>(
          `https://pbw-backend-api.vercel.app/api/purchases?action=getOffer&search=${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.error) {
          throw new Error(
            response.data.message || "Failed to fetch offer detail"
          );
        }

        if (!response.data?.data || response.data.data.length === 0) {
          return null;
        }

        const offerData = response.data.data[0];

        if (
          offerData.tax_details &&
          typeof offerData.tax_details === "string"
        ) {
          try {
            offerData.tax_details = JSON.parse(offerData.tax_details);
          } catch (e) {
            console.warn("Failed to parse tax_details JSON:", e);
          }
        }

        return offerData;
      } catch (error) {
        console.error("Error fetching offer detail:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            return null;
          }
          throw new Error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch offer detail"
          );
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
