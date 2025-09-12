
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from './useRoleAccess';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useRoleGuard = (requiredRole?: string, redirectTo: string = '/') => {
  const { user, loading: authLoading } = useAuth();
  const { userRole, isLoading: roleLoading } = useRoleAccess();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      toast.error('You must be logged in to access this page');
      navigate('/login');
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      toast.error(`Access denied. Required role: ${requiredRole}`);
      navigate(redirectTo);
      return;
    }
  }, [user, userRole, authLoading, roleLoading, requiredRole, navigate, redirectTo]);

  return {
    isLoading: authLoading || roleLoading,
    hasAccess: user && (!requiredRole || userRole === requiredRole),
    userRole,
  };
};
