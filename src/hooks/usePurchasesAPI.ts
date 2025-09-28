import { useState, useEffect } from 'react';
import axios from 'axios';

// Base API response interface
export interface PurchaseAPIResponse {
  id: string;
  date: string;
  number: string;
  status: string;
  amount: number;
  grand_total?: number;
  items?: any[];
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow additional properties
}

export interface PurchasesAPIResponse {
  data: PurchaseAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: boolean;
  message?: string;
}

// Action mapping for different purchase types
export const PURCHASE_ACTIONS = {
  QUOTATION: 'getQuotation',
  INVOICE: 'getInvoice',
  SHIPMENT: 'getShipment',
  ORDER: 'getOrder',
  REQUEST: 'getRequest',
  APPROVAL: 'getApprovalQuotation',
  OFFER: 'getOffer'
} as const;

export type PurchaseAction = typeof PURCHASE_ACTIONS[keyof typeof PURCHASE_ACTIONS];

// Generic hook for fetching purchases from API
export const usePurchasesAPI = (action: PurchaseAction) => {
  const [data, setData] = useState<PurchaseAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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

  // Fetch purchases function
  const fetchPurchases = async (currentPage: number, currentLimit: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      
      const response = await axios.get(
        'https://pbw-backend-api.vercel.app/api/purchases',
        {
          params: {
            action,
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
        setTotal(response.data.total || 0);
        
        // Calculate total pages if not provided
        if (response.data.totalPages) {
          setTotalPages(response.data.totalPages);
        } else if (response.data.total && currentLimit) {
          setTotalPages(Math.ceil(response.data.total / currentLimit));
        }
      } else {
        throw new Error(response.data?.message || `Failed to fetch ${action} data`);
      }
    } catch (err) {
      console.error(`Error fetching ${action}:`, err);
      
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || `Failed to fetch ${action} data`;
        setError(errorMessage);
      } else {
        setError(`Failed to fetch ${action} data. Please try again.`);
      }
      
      setData([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when page, limit, or action changes
  useEffect(() => {
    fetchPurchases(page, limit);
  }, [page, limit, action]);

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
    fetchPurchases(page, limit);
  };

  return {
    data,
    isLoading,
    error,
    page,
    limit,
    totalPages,
    total,
    handlePageChange,
    handleLimitChange,
    refresh
  };
};

// Specific hooks for each purchase type
export const useInvoicesAPI = () => usePurchasesAPI(PURCHASE_ACTIONS.INVOICE);
export const useOffersAPI = () => usePurchasesAPI(PURCHASE_ACTIONS.OFFER);
export const useOrdersAPI = () => usePurchasesAPI(PURCHASE_ACTIONS.ORDER);
export const useRequestsAPI = () => usePurchasesAPI(PURCHASE_ACTIONS.REQUEST);
export const useShipmentsAPI = () => usePurchasesAPI(PURCHASE_ACTIONS.SHIPMENT);
export const useQuotationsAPI = () => usePurchasesAPI(PURCHASE_ACTIONS.QUOTATION);
export const useApprovalAPI = () => usePurchasesAPI(PURCHASE_ACTIONS.APPROVAL);
