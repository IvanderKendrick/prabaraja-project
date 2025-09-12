
import { ReactNode } from 'react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'member' | 'team_lead' | 'division_member';
  fallback?: ReactNode;
  showError?: boolean;
}

export const RoleGuard = ({ 
  children, 
  requiredRole, 
  fallback,
  showError = true 
}: RoleGuardProps) => {
  const { userRole, isLoading } = useRoleAccess();

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  const hasAccess = !requiredRole || userRole === requiredRole;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Alert className="m-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this content. Required role: {requiredRole}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};
