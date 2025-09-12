
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Asset {
  id: string;
  user_id: string;
  asset_tag: number;
  asset_type: 'computer' | 'furniture' | 'vehicle' | 'other';
  asset_name: string;
  model?: string;
  assigned_to: string;
  department: string;
  manufacturer?: string;
  serial_number?: string;
  purchase_date: string;
  purchase_price: number;
  warranty_deadline?: string;
  status: string;
  notes?: string;
  invoice_no?: string;
  sale_date?: string;
  sale_price?: number;
  sold_to?: string;
  reason_for_sale?: string;
  created_at: string;
  updated_at?: string;
}

export const useAssets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        throw error;
      }

      return data as Asset[];
    },
    enabled: !!user,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newAsset: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('assets')
        .insert([{
          ...newAsset,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating asset:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Asset> }) => {
      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating asset:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting asset:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};
