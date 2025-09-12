
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SalesInvoice, OrderDelivery, Quotation } from './useSalesData';

// Hook to fetch a single sales invoice by ID
export const useSalesInvoiceById = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sales-invoice', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching sales invoice:', error);
        throw error;
      }

      return data as SalesInvoice | null;
    },
    enabled: !!user && !!id,
  });
};

// Hook to fetch a single order delivery by ID
export const useOrderDeliveryById = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order-delivery', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      const { data, error } = await supabase
        .from('order_deliveries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching order delivery:', error);
        throw error;
      }

      return data as OrderDelivery | null;
    },
    enabled: !!user && !!id,
  });
};

// Hook to fetch a single quotation by ID
export const useQuotationById = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching quotation:', error);
        throw error;
      }

      return data as Quotation | null;
    },
    enabled: !!user && !!id,
  });
};
