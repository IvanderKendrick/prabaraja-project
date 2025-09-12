import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface JournalTransaction {
  id: string;
  coa_code: string;
  description: string;
  transaction_date: string;
  credit: number;
  debit: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useJournalTransactions = (coaCode?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['journal-transactions', coaCode],
    queryFn: async () => {
      let query = supabase
        .from('receive_payment_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (coaCode) {
        query = query.eq('coa_code', coaCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching journal transactions:', error);
        throw error;
      }

      return data as JournalTransaction[];
    },
    enabled: !!user,
  });
};