import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// API response interface for Sales Approval
export interface ApprovalSalesAPIResponse {
  id: string;
  number: string;
  customer_name: string;
  status: string;
  quotation_date?: string;
  order_date?: string;
  invoice_date?: string;
  total?: number | string;
  grand_total?: number | string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ApprovalSalesAPIListResponse {
  data: ApprovalSalesAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: boolean;
  message?: string;
}

export type ApprovalSalesAction = "getApprovalQuotation" | "getApprovalOrder" | "getApprovalInvoice";

// Generic hook for fetching sales approval data from API
export const useApprovalsSales = (action: ApprovalSalesAction, refreshKey?: number) => {
  const [data, setData] = useState<ApprovalSalesAPIResponse[]>([]);
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

  // Fetch sales approval data function
  const fetchApprovalData = useCallback(
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
            throw new Error(response.data?.message || `Failed to fetch ${action} approval data`);
          }
        }
      } catch (err) {
        console.error(`Error fetching ${action} approval:`, err);

        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || err.message || `Failed to fetch ${action} approval data`;
          setError(errorMessage);
        } else {
          setError(`Failed to fetch ${action} approval data. Please try again.`);
        }

        setData([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [action]
  );

  // Fetch data when page, limit, or action changes
  useEffect(() => {
    fetchApprovalData(page, limit);
  }, [fetchApprovalData, page, limit, refreshKey]);

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
    fetchApprovalData(page, limit);
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
    refresh,
  };
};
