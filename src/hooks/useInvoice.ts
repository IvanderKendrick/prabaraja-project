
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InvoiceDetail {
  id: string;
  user_id: string;
  number: number;
  type: string;
  date: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'Unpaid' | 'Pending';
  approver: string;
  tags?: string[];
  items: any[];
  tax_calculation_method: boolean;
  ppn_percentage?: number;
  pph_percentage?: number;
  pph_type?: string;
  dpp?: number;
  ppn?: number;
  pph?: number;
  grand_total: number;
  created_at: string;
  updated_at?: string;
}

export const useInvoiceById = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        throw error;
      }

      return data as InvoiceDetail;
    },
    enabled: !!user && !!id,
  });
};
