import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChartOfAccount {
  id: string;
  account_code: string;
  name: string;
  category: string;
  detail_type: string;
  detail_desc: string;
  tax: string | null;
  bank_name: string | null;
  entry_balance: number;
  description: string | null;
  user_access: string;
  lock_option: boolean;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  level: number;
  parent_code: string | null;
  parent_id: string | null;
}

export const useChartOfAccounts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('account_code', { ascending: true });

      if (error) {
        console.error('Error fetching chart of accounts:', error);
        throw error;
      }

      return data as ChartOfAccount[];
    },
    enabled: !!user,
  });
};

export const useCreateChartOfAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAccount: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([newAccount])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    },
  });
};