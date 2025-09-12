
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Sale {
  id: string;
  user_id: string;
  number: number;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  status: 'Paid' | 'Unpaid' | 'Late Payment' | 'Awaiting Payment';
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

export const useSales = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales:', error);
        throw error;
      }

      return data as Sale[];
    },
    enabled: !!user,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newSale: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sales')
        .insert([{
          ...newSale,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating sale:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Sale> }) => {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating sale:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting sale:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};
