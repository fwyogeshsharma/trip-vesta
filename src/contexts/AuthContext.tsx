import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, removeAuthToken, getUserData } from '@/services/authService';

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  roles?: string[];
  role_names?: string[];
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasInvestorAccess: () => boolean;
  hasAdminAccess: () => boolean;
  hasIPAdminAccess: () => boolean;
  debugUserRoles: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = getAuthToken();
    const userData = getUserData();

    console.log('AuthContext - Loading from localStorage:');
    console.log('  token:', token);
    console.log('  userData:', userData);
    console.log('  userData.roles:', userData?.roles);

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
      console.log('AuthContext - User set to:', userData);
      // You might want to validate the token with your API here
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData?: User) => {
    setIsAuthenticated(true);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;

    // Use role_names if available, fallback to roles
    const userRoles = user.role_names || user.roles;
    if (!userRoles) return false;

    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
    return rolesArray.some(userRole =>
      String(userRole).trim() === role.trim()
    );
  };

  const hasInvestorAccess = (): boolean => {
    if (!user) {
      console.log('hasInvestorAccess: No user found');
      return false;
    }

    // Use role_names if available, fallback to roles
    const userRoles = user.role_names || user.roles;
    if (!userRoles) {
      console.log('hasInvestorAccess: No roles or role_names found');
      return false;
    }

    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
    console.log('hasInvestorAccess: Checking roles:', rolesArray);

    const hasRole = rolesArray.some(role => {
      const roleStr = String(role).toLowerCase().trim();
      console.log(`hasInvestorAccess: Checking role "${roleStr}" against "investor"`);
      return roleStr === 'investor';
    });

    console.log('hasInvestorAccess result:', hasRole);
    return hasRole;
  };

  const hasAdminAccess = (): boolean => {
    if (!user) {
      console.log('hasAdminAccess: No user found');
      return false;
    }

    // Use role_names if available, fallback to roles
    const userRoles = user.role_names || user.roles;
    if (!userRoles) {
      console.log('hasAdminAccess: No roles or role_names found');
      return false;
    }

    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
    console.log('hasAdminAccess: Checking roles:', rolesArray);

    const hasRole = rolesArray.some(role => {
      const roleStr = String(role).toLowerCase().trim();
      console.log(`hasAdminAccess: Checking role "${roleStr}" against "ip admin" or "admin"`);
      return roleStr === 'ip admin' || roleStr === 'admin';
    });

    console.log('hasAdminAccess result:', hasRole);
    return hasRole;
  };

  const hasIPAdminAccess = (): boolean => {
    if (!user) {
      console.log('hasIPAdminAccess: No user found');
      return false;
    }

    // Use role_names if available, fallback to roles
    const userRoles = user.role_names || user.roles;
    if (!userRoles) {
      console.log('hasIPAdminAccess: No roles or role_names found');
      return false;
    }

    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
    console.log('hasIPAdminAccess: Checking roles:', rolesArray);

    const hasRole = rolesArray.some(role => {
      const roleStr = String(role).toLowerCase().trim();
      console.log(`hasIPAdminAccess: Checking role "${roleStr}" against "ip admin"`);
      return roleStr === 'ip admin';
    });

    console.log('hasIPAdminAccess result:', hasRole);
    return hasRole;
  };

  // Debug function to log user roles
  const debugUserRoles = () => {
    console.log('=== ROLE DEBUG ===');
    console.log('User:', user);
    console.log('User Roles (roles):', user?.roles);
    console.log('User Role Names (role_names):', user?.role_names);

    // Check role_names array
    if (user?.role_names) {
      const roleNamesArray = Array.isArray(user.role_names) ? user.role_names : [user.role_names];
      console.log('Processed Role Names Array:', roleNamesArray);
      roleNamesArray.forEach((role, index) => {
        console.log(`Role Name ${index}:`, role, `(type: ${typeof role})`);
        console.log(`  Lowercase trimmed: "${String(role).toLowerCase().trim()}"`);
      });
    }

    // Check roles array (legacy)
    if (user?.roles) {
      const rolesArray = Array.isArray(user.roles) ? user.roles : [user.roles];
      console.log('Processed Roles Array (legacy):', rolesArray);
      rolesArray.forEach((role, index) => {
        console.log(`Legacy Role ${index}:`, role, `(type: ${typeof role})`);
      });
    }

    console.log('Has Investor Access:', hasInvestorAccess());
    console.log('Has Admin Access:', hasAdminAccess());
    console.log('Has IP Admin Access:', hasIPAdminAccess());
    console.log('==================');
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
    hasRole,
    hasInvestorAccess,
    hasAdminAccess,
    hasIPAdminAccess,
    debugUserRoles,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};