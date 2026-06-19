import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, BarChart3, ShieldCheck, Users } from 'lucide-react';
import { APP_NAME } from '../constants';

const FEATURES = [
  { icon: Building2, text: 'Manage multiple malls and properties from one dashboard' },
  { icon: Users, text: 'Track tenants, leases, and shop occupancy in real time' },
  { icon: BarChart3, text: 'Get actionable insights with revenue & occupancy reports' },
  { icon: ShieldCheck, text: 'Role-based access for owners, managers, and accountants' },
];

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-surface-dark">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary-700 px-12 py-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-600/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-primary-900/40 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            Run your mall operations with confidence and clarity.
          </h1>
          <p className="mt-3 text-primary-100">
            A complete platform for mall owners, managers, accountants, and tenants to
            collaborate seamlessly.
          </p>

          <div className="mt-10 space-y-4">
            {FEATURES.map((f, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-sm text-primary-50">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-200">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-50">{APP_NAME}</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
