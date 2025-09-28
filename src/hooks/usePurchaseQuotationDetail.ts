import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface QuotationDetailData {
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
  }>;
  terms?: string;
  memo?: string;
  tax_details?: string | object;
  total: number;
  grand_total: number;
  attachment_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface QuotationDetailResponse {
  data?: QuotationDetailData;
  error?: boolean;
  message?: string;
}

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!authDataRaw) {
    throw new Error("No access token found in localStorage");
  }
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) {
    throw new Error("Access token missing in parsed auth data");
  }
  return token;
};

export const usePurchaseQuotationDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['purchase-quotation-detail', id],
    queryFn: async (): Promise<QuotationDetailData | null> => {
      if (!id) {
        throw new Error('Quotation ID is required');
      }

      try {
        const token = getAuthToken();
        
        const response = await axios.get<QuotationDetailResponse>(
          `https://pbw-backend-api.vercel.app/api/purchases?action=getQuotation&search=${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.data?.error) {
          throw new Error(response.data.message || 'Failed to fetch quotation detail');
        }

        if (!response.data?.data) {
          return null; // Data not found
        }

        // Parse tax_details if it's a string
        const quotationData = response.data.data;
        if (quotationData.tax_details && typeof quotationData.tax_details === 'string') {
          try {
            quotationData.tax_details = JSON.parse(quotationData.tax_details);
          } catch (e) {
            console.warn('Failed to parse tax_details JSON:', e);
          }
        }

        return quotationData;
      } catch (error) {
        console.error('Error fetching quotation detail:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            return null; // Data not found
          }
          throw new Error(error.response?.data?.message || error.message || 'Failed to fetch quotation detail');
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry if data not found (404)
      if (error instanceof Error && error.message.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
