import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, CreatorProfile, BrandProfile } from '../types';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  profile: CreatorProfile | BrandProfile | null;
  completionScore: number;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<{ user: User; redirectTo?: string }>;
  signup: (data: { email: string; password: string; displayName: string; role: 'creator' | 'brand' }) => Promise<{ user: User; nextStep?: string }>;
  logout: () => Promise<void>;
  updateProfile: (payload: Record<string, unknown>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | BrandProfile | null>(null);
  const [completionScore, setCompletionScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCurrentUser();
      setUser(data.user);
      setProfile(data.profile);

      // Fetch profile completion
      try {
        const profData = await apiClient.getMyProfile();
        setCompletionScore(profData.completionScore || 0);
      } catch (err) {
        // Fallback
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
      setCompletionScore(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await apiClient.login(credentials);
    setUser(res.user);
    await fetchSession();
    return { user: res.user, redirectTo: res.redirectTo };
  };

  const signup = async (payload: { email: string; password: string; displayName: string; role: 'creator' | 'brand' }) => {
    const res = await apiClient.signup(payload);
    setUser(res.user);
    await fetchSession();
    return { user: res.user, nextStep: res.nextStep };
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    setProfile(null);
    setCompletionScore(0);
  };

  const updateProfile = async (payload: Record<string, unknown>) => {
    const res = await apiClient.updateMyProfile(payload);
    setProfile(res.profile);
    setCompletionScore(res.completionScore);
    if (user) {
      setUser({ ...user, isProfileComplete: res.isComplete });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        completionScore,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
