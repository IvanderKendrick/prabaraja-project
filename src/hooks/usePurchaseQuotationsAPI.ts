import { useState, useEffect } from 'react';
import axios from 'axios';

// API Response interface
export interface QuotationAPIResponse {
  id: string;
  quotation_date: string;
  request_by?: string;
  urgency?: string;
  due_date: string;
  status: string;
  tags?: string;
  items: any[];
  grand_total: number;
  memo?: string;
  attachment_url?: string;
  vendor_name: string;
  vendor_address?: string;
  vendor_phone?: string;
  start_date: string;
  tax_details?: any;
  tax_method?: string;
  dpp: number;
  ppn: number;
  pph: number;
  valid_until: string;
  terms?: string;
  total: number;
  number: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationsAPIResponse {
  data: QuotationAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: boolean;
  message?: string;
}

// Hook for fetching purchase quotations from API
export const usePurchaseQuotationsAPI = () => {
  const [data, setData] = useState<QuotationAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Get auth token helper function
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

  // Fetch quotations function
  const fetchQuotations = async (currentPage: number, currentLimit: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      
      const response = await axios.get(
        'https://pbw-backend-api.vercel.app/api/purchases',
        {
          params: {
            action: 'getQuotation',
            limit: currentLimit,
            page: currentPage
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && !response.data.error) {
        setData(response.data.data || []);
        
        // Calculate total pages if not provided
        if (response.data.totalPages) {
          setTotalPages(response.data.totalPages);
        } else if (response.data.total && currentLimit) {
          setTotalPages(Math.ceil(response.data.total / currentLimit));
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch quotations');
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
      
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch quotations';
        setError(errorMessage);
      } else {
        setError('Failed to fetch quotations. Please try again.');
      }
      
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when page or limit changes
  useEffect(() => {
    fetchQuotations(page, limit);
  }, [page, limit]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  // Refresh data
  const refresh = () => {
    fetchQuotations(page, limit);
  };

  return {
    data,
    isLoading,
    error,
    page,
    limit,
    totalPages,
    handlePageChange,
    handleLimitChange,
    refresh
  };
};
