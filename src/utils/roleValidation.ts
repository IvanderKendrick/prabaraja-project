
import { UserRole } from './roleUtils';

export interface RolePermissions {
  canViewAllData: boolean;
  canCreateData: boolean;
  canEditData: boolean;
  canDeleteData: boolean;
  canManageUsers: boolean;
  canChangeUserRoles: boolean;
  canAccessReports: boolean;
  canManageAssets: boolean;
  canManageBankAccounts: boolean;
  canViewFinancialData: boolean;
}

export const getRolePermissions = (role: string | null): RolePermissions => {
  const defaultPermissions: RolePermissions = {
    canViewAllData: false,
    canCreateData: false,
    canEditData: false,
    canDeleteData: false,
    canManageUsers: false,
    canChangeUserRoles: false,
    canAccessReports: false,
    canManageAssets: false,
    canManageBankAccounts: false,
    canViewFinancialData: false,
  };

  if (!role) return defaultPermissions;

  switch (role.toLowerCase()) {
    case 'admin':
      return {
        canViewAllData: true,
        canCreateData: true,
        canEditData: true,
        canDeleteData: true,
        canManageUsers: true,
        canChangeUserRoles: true,
        canAccessReports: true,
        canManageAssets: true,
        canManageBankAccounts: true,
        canViewFinancialData: true,
      };

    case 'team_lead':
      return {
        canViewAllData: true,
        canCreateData: true,
        canEditData: true,
        canDeleteData: false,
        canManageUsers: false,
        canChangeUserRoles: false,
        canAccessReports: true,
        canManageAssets: true,
        canManageBankAccounts: false,
        canViewFinancialData: true,
      };

    case 'division_member':
      return {
        canViewAllData: false,
        canCreateData: true,
        canEditData: true,
        canDeleteData: false,
        canManageUsers: false,
        canChangeUserRoles: false,
        canAccessReports: false,
        canManageAssets: false,
        canManageBankAccounts: false,
        canViewFinancialData: false,
      };

    case 'member':
    default:
      return {
        canViewAllData: false,
        canCreateData: true,
        canEditData: false,
        canDeleteData: false,
        canManageUsers: false,
        canChangeUserRoles: false,
        canAccessReports: false,
        canManageAssets: false,
        canManageBankAccounts: false,
        canViewFinancialData: false,
      };
  }
};

export const hasPermission = (userRole: string | null, permission: keyof RolePermissions): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions[permission];
};

export const validateAction = (
  userRole: string | null, 
  action: keyof RolePermissions,
  resourceOwner?: string,
  currentUserId?: string
): { allowed: boolean; reason?: string } => {
  const permissions = getRolePermissions(userRole);
  
  if (!permissions[action]) {
    return {
      allowed: false,
      reason: `Your role (${userRole || 'none'}) doesn't have permission for this action`
    };
  }

  // Additional check for data ownership
  if (resourceOwner && currentUserId && resourceOwner !== currentUserId) {
    // Only admins and team leads can modify other users' data
    if (userRole !== 'admin' && userRole !== 'team_lead') {
      return {
        allowed: false,
        reason: 'You can only modify your own data'
      };
    }
  }

  return { allowed: true };
};
