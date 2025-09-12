
export type UserRole = 'admin' | 'member' | 'team_lead' | 'division_member';

export const AVAILABLE_ROLES: UserRole[] = ['admin', 'member'];

// Future roles that will be implemented later
export const FUTURE_ROLES: UserRole[] = ['team_lead', 'division_member'];

export const getRoleDisplayName = (role: string | null): string => {
  if (!role) return 'No Role';
  
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Admin';
    case 'member':
      return 'Member';
    case 'team_lead':
      return 'Team Lead';
    case 'division_member':
      return 'Division Member';
    default:
      return role;
  }
};

export const getRoleColor = (role: string | null): string => {
  if (!role) return 'gray';
  
  switch (role.toLowerCase()) {
    case 'admin':
      return 'blue';
    case 'member':
      return 'gray';
    case 'team_lead':
      return 'green';
    case 'division_member':
      return 'purple';
    default:
      return 'gray';
  }
};

export const canChangeRole = (currentUserRole: string | null, targetUserRole: string | null): boolean => {
  // Only admins can change roles
  return currentUserRole === 'admin';
};

export const canChangeOwnRole = (currentUserId: string, targetUserId: string): boolean => {
  // Users cannot change their own role
  return currentUserId !== targetUserId;
};

export const validateRoleChange = (
  currentUserRole: string | null,
  currentUserId: string,
  targetUserId: string,
  newRole: string
): { isValid: boolean; error?: string } => {
  // Check if user is admin
  if (currentUserRole !== 'admin') {
    return { isValid: false, error: 'Only admins can change user roles' };
  }

  // Check if trying to change own role
  if (currentUserId === targetUserId) {
    return { isValid: false, error: 'You cannot change your own role' };
  }

  // Check if new role is valid
  if (!AVAILABLE_ROLES.includes(newRole as UserRole)) {
    return { isValid: false, error: 'Invalid role selected' };
  }

  return { isValid: true };
};
