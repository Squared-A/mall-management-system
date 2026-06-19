import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, ShieldOff, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { ROUTES } from '../constants/routes';

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-surface-dark px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <AlertCircle className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-200 dark:text-gray-700">404</h1>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">Page not found</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button icon={Home} onClick={() => navigate(ROUTES.DASHBOARD)}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-surface-dark px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-500/10">
          <ShieldOff className="h-10 w-10 text-danger-500" />
        </div>
        <h1 className="text-6xl font-extrabold text-danger-100 dark:text-danger-900/50">403</h1>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">Access Denied</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="mt-8">
          <Link to={ROUTES.DASHBOARD}>
            <Button icon={Home}>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
