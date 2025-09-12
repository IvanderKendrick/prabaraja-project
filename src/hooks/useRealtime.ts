
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set up realtime subscriptions for all tables
    const channels = [
      {
        table: 'assets',
        queryKey: ['assets'],
      },
      {
        table: 'products',
        queryKey: ['products'],
      },
      {
        table: 'warehouses',
        queryKey: ['warehouses'],
      },
      {
        table: 'contacts',
        queryKey: ['contacts'],
      },
      {
        table: 'expenses',
        queryKey: ['expenses'],
      },
      {
        table: 'sales',
        queryKey: ['sales'],
      },
      {
        table: 'invoices',
        queryKey: ['invoices'],
      },
    ];

    const subscriptions = channels.map(({ table, queryKey }) => {
      return supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => {
            console.log(`Realtime update for ${table}:`, payload);
            queryClient.invalidateQueries({ queryKey });
          }
        )
        .subscribe();
    });

    return () => {
      subscriptions.forEach((subscription) => {
        supabase.removeChannel(subscription);
      });
    };
  }, [user, queryClient]);
};
