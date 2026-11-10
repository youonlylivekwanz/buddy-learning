'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '@/types';
import { Role } from '@/lib/db';
import { PublicUserPersona, VERIFIED_PERSONAS } from '@/lib/auth/personas';

interface AuthContextType {
  currentUser: PublicUserPersona | null;
  isLoading: boolean;
  availablePersonas: PublicUserPersona[];
  canAccessRole: (viewRole: UserRole) => boolean;
  loginAs: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<Role, UserRole[]> = {
  [Role.LEARNER]: ['dashboard', 'learner'],
  [Role.TUTOR]: ['dashboard', 'tutor'],
  [Role.BRANCH_MANAGER]: ['dashboard', 'sponsor'],
  [Role.GLOBAL_ADMIN]: ['dashboard', 'learner', 'tutor', 'sponsor', 'admin'],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<PublicUserPersona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Session fetch error:', err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const canAccessRole = useCallback(
    (viewRole: UserRole): boolean => {
      if (!currentUser) return false;
      const allowed =
        currentUser.allowedViews || ROLE_PERMISSIONS[currentUser.role] || ['dashboard'];
      return allowed.includes(viewRole);
    },
    [currentUser]
  );

  const loginAs = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsAccountModalOpen(false);
        }
      }
    } catch (err) {
      console.error('[AuthContext] Failed to switch user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/session', { method: 'DELETE' });
      setCurrentUser(null);
    } catch (err) {
      console.error('[AuthContext] Failed to log out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        availablePersonas: VERIFIED_PERSONAS,
        canAccessRole,
        loginAs,
        logout,
        isAccountModalOpen,
        setIsAccountModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
