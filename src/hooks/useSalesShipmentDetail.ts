import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ShipmentDetailData {
  id: string;
  number: string;
  quotation_date?: string;
  valid_until?: string;
  date?: string;
  shipping_date?: string;
  due_date?: string;
  vendor_name?: string;
  customer_name?: string;
  vendor_address?: string;
  customer_address?: string;
  vendor_phone?: string;
  customer_phone?: string;
  status?: string;
  items?: Array<any>;
  terms?: string;
  memo?: string;
  tax_details?: any;
  total?: number;
  grand_total?: number;
  attachment_url?: string | string[];
}

interface ShipmentDetailResponse {
  data?: ShipmentDetailData[];
  error?: boolean;
  message?: string;
}

const getAuthToken = () => {
  const raw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!raw) throw new Error("No auth token in localStorage");
  const parsed = JSON.parse(raw);
  if (!parsed?.access_token) throw new Error("Access token missing");
  return parsed.access_token;
};

export const useSalesShipmentDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["sales-shipment-detail", id],
    queryFn: async (): Promise<ShipmentDetailData | null> => {
      if (!id) throw new Error("Shipment ID is required");
      try {
        const token = getAuthToken();
        const url = `https://pbw-backend-api.vercel.app/api/sales?action=getShipment&status=&search=${id}`;
        const res = await axios.get<ShipmentDetailResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.error) throw new Error(res.data.message || "Failed to fetch shipment detail");
        if (!res.data?.data || res.data.data.length === 0) return null;
        const data = res.data.data[0];
        if (data.tax_details && typeof data.tax_details === "string") {
          try {
            data.tax_details = JSON.parse(data.tax_details);
          } catch (e) {}
        }
        return data;
      } catch (err: any) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message || err.message);
        throw err;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => failureCount < 2,
  });
};
