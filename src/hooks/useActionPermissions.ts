
import { useRoleAccess } from './useRoleAccess';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, validateAction, RolePermissions } from '@/utils/roleValidation';
import { toast } from 'sonner';

export const useActionPermissions = () => {
  const { userRole } = useRoleAccess();
  const { user } = useAuth();

  const checkPermission = (permission: keyof RolePermissions): boolean => {
    return hasPermission(userRole, permission);
  };

  const canPerformAction = (
    action: keyof RolePermissions,
    resourceOwner?: string,
    showToast: boolean = false
  ): boolean => {
    const validation = validateAction(userRole, action, resourceOwner, user?.id);
    
    if (!validation.allowed && showToast) {
      toast.error(validation.reason || 'Action not permitted');
    }
    
    return validation.allowed;
  };

  const requirePermission = (
    permission: keyof RolePermissions,
    resourceOwner?: string
  ): boolean => {
    return canPerformAction(permission, resourceOwner, true);
  };

  return {
    userRole,
    checkPermission,
    canPerformAction,
    requirePermission,
    
    // Convenience methods for common permissions
    canViewAllData: () => checkPermission('canViewAllData'),
    canCreateData: () => checkPermission('canCreateData'),
    canEditData: (resourceOwner?: string) => canPerformAction('canEditData', resourceOwner),
    canDeleteData: (resourceOwner?: string) => canPerformAction('canDeleteData', resourceOwner),
    canManageUsers: () => checkPermission('canManageUsers'),
    canChangeUserRoles: () => checkPermission('canChangeUserRoles'),
    canAccessReports: () => checkPermission('canAccessReports'),
    canManageAssets: () => checkPermission('canManageAssets'),
    canManageBankAccounts: () => checkPermission('canManageBankAccounts'),
    canViewFinancialData: () => checkPermission('canViewFinancialData'),
  };
};
