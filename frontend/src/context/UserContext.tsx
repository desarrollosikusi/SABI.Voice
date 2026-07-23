'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrentUser, userService } from '@/services/userService';

interface UserContextProps {
  user: CurrentUser | null;
  loading: boolean;
  refreshCurrentUser: () => Promise<void>;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCurrentUser = async () => {
    try {
      const fetchedUser = await userService.getCurrentUser();
      setUser(fetchedUser);
    } catch (error) {
      console.error("Failed to load user session", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setUser(null);
  };

  useEffect(() => {
    refreshCurrentUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshCurrentUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
