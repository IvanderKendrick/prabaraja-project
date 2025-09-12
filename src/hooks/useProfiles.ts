
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
  company_logo: string | null;
}

// Hook to fetch all user profiles (admin only)
export const useProfiles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      return data as UserProfile[];
    },
    enabled: !!user,
  });
};

// Hook to update user role
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    },
  });
};

// Hook to update current user profile name
export const useUpdateProfileName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          name: name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile name:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
      toast.success('Username updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update username:', error);
      toast.error('Failed to update username');
    },
  });
};

// Hook to get current user profile with enhanced debugging
export const useCurrentUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn('No user ID available for profile fetch');
        return null;
      }

      console.log('Fetching profile for user:', user.id);

      // Try using the security definer function first
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_current_user_profile');

      if (functionError) {
        console.error('Error fetching profile via function:', functionError);
        
        // Fallback to direct table query
        console.log('Attempting fallback to direct table query...');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching current user profile via direct query:', error);
          throw error;
        }

        console.log('Profile data from direct query:', data);
        return data as UserProfile | null;
      }

      console.log('Profile data from function:', functionData);
      return functionData?.[0] as UserProfile | null;
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
