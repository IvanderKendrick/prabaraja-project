
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Warehouse {
  id: string;
  user_id: string;
  number: number;
  name: string;
  location: string;
  total_stock: number;
  created_at: string;
  updated_at?: string;
}

export const useWarehouses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching warehouses:', error);
        throw error;
      }

      return data as Warehouse[];
    },
    enabled: !!user,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newWarehouse: Omit<Warehouse, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('warehouses')
        .insert([{
          ...newWarehouse,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating warehouse:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Warehouse> }) => {
      const { data, error } = await supabase
        .from('warehouses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating warehouse:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting warehouse:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};
