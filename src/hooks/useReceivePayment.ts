import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCreateReceivePaymentTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      transaction_date: string;
      description: string;
      coa_code: string;
      debit?: number;
      credit?: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Direct insert to receive_payment_transactions table using raw query
      const { data: insertResult, error: insertError } = await supabase
        .from('receive_payment_transactions' as any)
        .insert({
          transaction_date: data.transaction_date,
          description: data.description,
          coa_code: data.coa_code,
          debit: data.debit || 0,
          credit: data.credit || 0,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return insertResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["receive-payment-transactions"] });
    },
  });
}