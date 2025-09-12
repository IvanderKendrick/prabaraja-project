
import { useCurrentUserProfile } from './useProfiles';

export const useRoleAccess = () => {
  const { data: profile, isLoading } = useCurrentUserProfile();

  // Get the user's role from their profile in Supabase
  const userRole = profile?.role || 'member';

  const isAdmin = userRole === 'admin';
  const isMember = userRole === 'member';
  const isTeamLead = userRole === 'team_lead';
  const isDivisionMember = userRole === 'division_member';

  // Permission checks based on role
  const canViewAllData = isAdmin;
  const canCreateData = isAdmin || isMember || isTeamLead;
  const canEditData = isAdmin || isTeamLead;
  const canDeleteData = isAdmin;
  
  // New permissions for role management
  const canManageUsers = isAdmin;
  const canChangeUserRoles = isAdmin;

  return {
    userRole,
    isAdmin,
    isMember,
    isTeamLead,
    isDivisionMember,
    canViewAllData,
    canCreateData,
    canEditData,
    canDeleteData,
    canManageUsers,
    canChangeUserRoles,
    isLoading,
    profile,
  };
};
