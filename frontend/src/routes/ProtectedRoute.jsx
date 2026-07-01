import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Building2, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const PendingMallApproval = ({ user, onLogout }) => {
  const primaryMall = user?.malls?.[0];
  const status = primaryMall?.status || user?.mallApprovalStatus || 'PENDING';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-surface-dark">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-50">
          Mall approval required
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {primaryMall?.name || 'Your mall'} is currently {status.toLowerCase()}.
          Platform approval is required before you can access dashboard,
          shops, tenants, leases, payments, staff, maintenance, expenses,
          reports, or announcements.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Building2 className="h-4 w-4" />
          <span>{primaryMall?.name || 'Registered mall'}</span>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" icon={LogOut} onClick={onLogout}>
            Sign out
          </Button>
          <Link to={ROUTES.REGISTER_MALL}>
            <Button variant="outline" className="w-full sm:w-auto">
              Register another mall
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Redirects unauthenticated users to the login page.
 * Wrap protected layout routes with this component.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing, user, logout } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingSpinner fullScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const ownsMall = (user?.mallIds?.length || 0) > 0 || (user?.malls?.length || 0) > 0;
  const isBlockedMallOwner =
    user?.role === ROLES.MALL_OWNER && ownsMall && user?.hasApprovedMall === false;

  if (isBlockedMallOwner) {
    return <PendingMallApproval user={user} onLogout={logout} />;
  }

  return children;
};

export default ProtectedRoute;
