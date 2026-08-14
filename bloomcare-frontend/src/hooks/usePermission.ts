// src/hooks/usePermission.ts
import { useAuthStore } from '../store/authStore';

type UserRole = 'admin' | 'pharmacy_owner' | 'user';

interface Permission {
  roles: UserRole[];
  // Future: Add permissions array
}

export const usePermission = () => {
  const { user, isAuthenticated } = useAuthStore();

  /**
   * Check if user has any of the required roles
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!isAuthenticated || !user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role as UserRole);
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  /**
   * Check if user is a pharmacy owner
   */
  const isPharmacyOwner = (): boolean => {
    return hasRole('pharmacy_owner');
  };

  /**
   * Check if user is a regular user
   */
  const isUser = (): boolean => {
    return hasRole('user');
  };

  /**
   * Check if user has access to pharmacy management
   */
  const canManagePharmacy = (): boolean => {
    return hasRole(['admin', 'pharmacy_owner']);
  };

  /**
   * Check if user can view admin dashboard
   */
  const canViewAdmin = (): boolean => {
    return hasRole('admin');
  };

  /**
   * Check if user can manage orders (admin or pharmacy owner)
   */
  const canManageOrders = (): boolean => {
    return hasRole(['admin', 'pharmacy_owner']);
  };

  /**
   * Check if user can manage users (admin only)
   */
  const canManageUsers = (): boolean => {
    return hasRole('admin');
  };

  return {
    hasRole,
    isAdmin,
    isPharmacyOwner,
    isUser,
    canManagePharmacy,
    canViewAdmin,
    canManageOrders,
    canManageUsers,
    user,
    isAuthenticated,
  };
};