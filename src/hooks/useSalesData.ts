import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SalesInvoice {
  id: string;
  user_id: string;
  number: number;
  customer_id?: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  status: "Paid" | "Unpaid" | "Late Payment" | "Awaiting Payment";
  items: any[];
  grand_total: number;
  tax_details?: {
    dpp: number;
    ppn: number;
    pph: number;
    grandTotal: number;
  };
  created_at: string;
  updated_at?: string;
}

export interface OrderDelivery {
  id: string;
  user_id: string;
  number: number;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_date: string;
  delivery_date: string;
  status: string;
  tracking_number: string;
  shipping_address: string;
  shipping_method: string;
  payment_method: string;
  items: any[];
  grand_total: number;
  tax_details?: {
    dpp: number;
    ppn: number;
    pph: number;
    grandTotal: number;
  };
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Quotation {
  id: string;
  user_id: string;
  number: number;
  customer_id?: string;
  customer_name: string;
  quotation_date: string;
  valid_until: string;
  status: string;
  items: any[];
  total: number;
  tax_details?: {
    dpp: number;
    ppn: number;
    pph: number;
    grandTotal: number;
  };
  terms?: string;
  created_at: string;
  updated_at?: string;
}

// Hook for Sales Invoices
export const useSalesInvoices = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sales invoices:", error);
        throw error;
      }

      return data as SalesInvoice[];
    },
    enabled: !!user,
  });
};

// Hook for Order & Delivery
export const useOrderDeliveries = (enabled: boolean = false) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order-deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_deliveries").select("*").order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching order deliveries:", error);
        throw error;
      }

      return data as OrderDelivery[];
    },
    enabled: !!user && enabled,
    // Prevent automatic background refetches (window focus / reconnect / interval)
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: false,
  });
};

// Hook for Quotations
export const useQuotations = (enabled: boolean = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotations").select("*").order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching quotations:", error);
        throw error;
      }

      return data as Quotation[];
    },
    enabled: !!user && enabled,
  });
};

// ========== MUTATION HOOKS ==========

import { useMutation, useQueryClient } from "@tanstack/react-query";

// Create Order Delivery
export const useCreateOrderDelivery = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newOrder: Omit<OrderDelivery, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("order_deliveries")
        .insert([
          {
            ...newOrder,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating order delivery:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-deliveries"] });
    },
  });
};

// Update Order Delivery
export const useUpdateOrderDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OrderDelivery> }) => {
      const { data, error } = await supabase.from("order_deliveries").update(updates).eq("id", id).select().single();

      if (error) {
        console.error("Error updating order delivery:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-deliveries"] });
    },
  });
};

// Delete Order Delivery
export const useDeleteOrderDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("order_deliveries").delete().eq("id", id);

      if (error) {
        console.error("Error deleting order delivery:", error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-deliveries"] });
    },
  });
};

// Create Quotation
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newQuotation: Omit<Quotation, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("quotations")
        .insert([
          {
            ...newQuotation,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating quotation:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
};

// Update Quotation
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Quotation> }) => {
      const { data, error } = await supabase.from("quotations").update(updates).eq("id", id).select().single();

      if (error) {
        console.error("Error updating quotation:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
};

// Delete Quotation
export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotations").delete().eq("id", id);

      if (error) {
        console.error("Error deleting quotation:", error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
};
