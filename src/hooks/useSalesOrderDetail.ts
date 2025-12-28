import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface OrderDetailData {
  id: string;
  number: string;
  order_date?: string;
  orders_date?: string;
  due_date?: string;
  status?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  items?: any[];
  total?: number;
  grand_total?: number;
  tax_details?: any;
  terms?: string;
  memo?: string;
  attachment_url?: string | string[];
}

const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No auth token in localStorage");
  const parsed = JSON.parse(raw);
  if (!parsed?.access_token) throw new Error("Access token missing");
  return parsed.access_token;
};

export const useSalesOrderDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["sales-order-detail", id],
    queryFn: async (): Promise<OrderDetailData | null> => {
      if (!id) throw new Error("Order ID is required");
      try {
        const token = getAuthToken();
        const url = `https://pbw-backend-api.vercel.app/api/sales?action=getOrder&status=&search=${id}`;
        const res = await axios.get<{ data?: OrderDetailData[]; error?: boolean; message?: string }>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.error) throw new Error(res.data.message || "Failed to fetch order detail");
        if (!res.data?.data || res.data.data.length === 0) return null;
        const order = res.data.data[0];
        if (order.tax_details && typeof order.tax_details === "string") {
          try {
            order.tax_details = JSON.parse(order.tax_details);
          } catch (e) {}
        }
        return order;
      } catch (err: any) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message || err.message);
        throw err;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => failureCount < 2,
  });
};

export default useSalesOrderDetail;
