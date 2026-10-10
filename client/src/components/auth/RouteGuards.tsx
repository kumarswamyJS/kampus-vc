import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../ui/LoadingState';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Verifying Session..." />;
  }

  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export const RoleGuard: React.FC<{ allowedRole: 'creator' | 'brand'; children: React.ReactNode }> = ({
  allowedRole,
  children,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Authorizing Access..." />;
  }

  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user.role !== allowedRole) {
    // Redirect creator trying to access brand route, or vice versa
    const fallback = user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export const DashboardRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Loading Dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'creator') {
    return <Navigate to="/creator/dashboard" replace />;
  } else {
    return <Navigate to="/brand/dashboard" replace />;
  }
};
