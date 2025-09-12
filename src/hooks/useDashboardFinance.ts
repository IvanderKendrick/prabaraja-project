import { useState, useEffect } from "react";

export interface FinanceSummaryData {
  profit: number;
  loss: number;
  month: string;
}

export interface FinanceApiResponse {
  error: boolean;
  data: {
    monthlyData: FinanceSummaryData[];
    currentMonthSales: number;
    previousMonthSales: number;
    currentMonthPayments: number;
    previousMonthPayments: number;
  };
}

export const useDashboardFinance = () => {
  const [data, setData] = useState<FinanceApiResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");

        if (!authDataRaw) {
          throw new Error("No access token found in localStorage");
        }

        const authData = JSON.parse(authDataRaw);
        const token = authData.access_token;

        if (!token) {
          throw new Error("Access token missing in parsed auth data");
        }

        const response = await fetch("https://pbw-backend-api.vercel.app/api/dashboard?action=summaryFinance", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: FinanceApiResponse = await response.json();

        if (!result.error && result.data) {
          setData(result.data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (err) {
        console.error("Error fetching finance data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch finance data");
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-trigger the useEffect by creating a new instance
    },
  };
};
