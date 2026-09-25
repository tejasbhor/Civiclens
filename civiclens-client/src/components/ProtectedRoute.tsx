import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';
import { PageLoader } from '@/components/PageLoader';
import { isOfficer, isCitizen } from '@/utils/authHelpers';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'citizen' | 'officer' | 'admin';
  redirectTo?: string;
}

/**
 * ProtectedRoute component that handles authentication and role-based access control
 * - Shows loading state while checking authentication
 * - Redirects to login if not authenticated
 * - Redirects to appropriate page if role doesn't match
 * - Works even when backend is down (uses local storage fallback)
 */
export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo 
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const reduce = useReducedMotion();


  // Show loading spinner while checking auth
  if (loading) {
    return <PageLoader />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    // Store the attempted location for redirect after login
    const returnUrl = location.pathname + location.search;
    const loginPath = requiredRole === 'officer' ? '/officer/login' : '/citizen/login';
    return <Navigate to={loginPath} state={{ from: returnUrl }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    if (requiredRole === 'officer' && !isOfficer(user.role)) {
      // User is not an officer - redirect to citizen dashboard
      return <Navigate to="/citizen/dashboard" replace />;
    } else if (requiredRole === 'citizen' && isOfficer(user.role)) {
      // User is an officer trying to access citizen route - redirect to officer dashboard
      return <Navigate to="/officer/dashboard" replace />;
    } else if (requiredRole === 'admin' && user.role !== 'admin' && user.role !== 'super_admin') {
      // User is not an admin - redirect appropriately
      if (isOfficer(user.role)) {
        return <Navigate to="/officer/dashboard" replace />;
      } else {
        return <Navigate to="/citizen/dashboard" replace />;
      }
    }
  }

  // Authenticated and authorized - render children
  // Short opacity fade on route change (no transform, so sticky headers stay put).
  return (
    <motion.div
      key={location.pathname}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
};

