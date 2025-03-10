import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, User } from '../lib/supabase';

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (username: string) => Promise<User | null>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for saved user on initial load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Set Supabase auth session
        setupSupabaseSession(userData.id);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Helper function to set up a session for Supabase RLS policies
  const setupSupabaseSession = async (userId: string) => {
    try {
      // This is a workaround for the custom auth system
      // It sets a custom header that will be sent with all Supabase requests
      supabase.realtime.setAuth(userId);
    } catch (error) {
      console.error('Error setting up Supabase session:', error);
    }
  };

  const login = async (username: string): Promise<User | null> => {
    try {
      // Check if username exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .limit(1);

      if (checkError) throw checkError;

      let userData: User;

      if (existingUsers && existingUsers.length > 0) {
        // User exists, use that record
        userData = existingUsers[0] as User;
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ username }])
          .select()
          .single();

        if (createError) throw createError;
        if (!newUser) throw new Error('Failed to create user');

        userData = newUser as User;
      }

      // Set up a session for Supabase to use with RLS policies
      await setupSupabaseSession(userData.id);

      // Save to local storage and state
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};