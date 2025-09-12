import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUpdateProfileLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logoFile }: { logoFile: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User not found');

      // Upload logo to storage
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // Update profile with logo URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ company_logo: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Company logo updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update logo:', error);
      toast.error('Failed to update company logo');
    },
  });
};