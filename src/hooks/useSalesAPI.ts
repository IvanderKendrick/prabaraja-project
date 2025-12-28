import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Base API response interface
export interface SalesAPIResponse {
  id: string;
  date: string;
  number: string;
  customer_name: string;
  status: string;
  amount?: number;
  grand_total?: number;
  total?: number;
  items?: Record<string, unknown>[];
  start_date?: string;
  expiry_date?: string;
  valid_until?: string;
  discount_terms?: string;
  terms?: string;
  offer_date?: string;
  quotation_date?: string;
  // Orders
  order_date?: string;
  level?: string;
  delivery_date?: string;
  unearned_revenue_amount?: number;
  // Shipments
  tracking_number?: string;
  carrier?: string;
  shipping_date?: string;
  // Invoices
  invoice_date?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface SalesAPIListResponse {
  data: SalesAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: boolean;
  message?: string;
}

// Action mapping for different sales types
export const SALES_ACTIONS = {
  QUOTATION: "getQuotation",
  OFFER: "getOffer",
  INVOICE: "getInvoice",
  ORDER: "getOrder",
  SHIPMENT: "getShipment",
} as const;

export type SalesAction = (typeof SALES_ACTIONS)[keyof typeof SALES_ACTIONS];

// Generic hook for fetching sales from API
export const useSalesAPI = (action: SalesAction) => {
  const [data, setData] = useState<SalesAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  // Get auth token helper function
  const getAuthToken = () => {
    const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
    if (!authDataRaw) {
      console.warn("No access token found in localStorage, continuing without authentication");
      return null;
    }
    const authData = JSON.parse(authDataRaw);
    const token = authData.access_token;
    if (!token) {
      console.warn("Access token missing in parsed auth data, continuing without authentication");
      return null;
    }
    return token;
  };

  // Fetch sales data function
  const fetchSalesData = useCallback(
    async (currentPage: number, currentLimit: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = getAuthToken();

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.get("https://pbw-backend-api.vercel.app/api/sales", {
          params: {
            action,
            status: status,
            search: search,
            limit: currentLimit,
            page: currentPage,
          },
          headers,
        });

        if (response.data) {
          if (Array.isArray(response.data)) {
            setData(response.data);
            setTotal(response.data.length);
            setTotalPages(Math.ceil(response.data.length / currentLimit));
          } else if (response.data.data) {
            setData(response.data.data || []);
            setTotal(response.data.total || 0);

            // Calculate total pages if not provided
            if (response.data.totalPages) {
              setTotalPages(response.data.totalPages);
            } else if (response.data.total && currentLimit) {
              setTotalPages(Math.ceil(response.data.total / currentLimit));
            }
          } else if (response.data.error) {
            throw new Error(response.data?.message || `Failed to fetch ${action} data`);
          }
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
    },
    [action, status, search]
  );

  // Fetch data when page, limit, status, search, or action changes
  useEffect(() => {
    fetchSalesData(page, limit);
  }, [fetchSalesData, page, limit]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  // Handle search change
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  // Refresh data
  const refresh = () => {
    fetchSalesData(page, limit);
  };

  return {
    data,
    isLoading,
    error,
    page,
    limit,
    totalPages,
    total,
    status,
    search,
    handlePageChange,
    handleLimitChange,
    handleStatusChange,
    handleSearchChange,
    refresh,
  };
};

// Specific hooks for each sales type
export const useSalesQuotationsAPI = () => useSalesAPI(SALES_ACTIONS.QUOTATION);
export const useSalesOffersAPI = () => useSalesAPI(SALES_ACTIONS.OFFER);
export const useSalesInvoicesAPI = () => useSalesAPI(SALES_ACTIONS.INVOICE);
export const useSalesOrdersAPI = () => useSalesAPI(SALES_ACTIONS.ORDER);
export const useSalesShipmentsAPI = () => useSalesAPI(SALES_ACTIONS.SHIPMENT);
