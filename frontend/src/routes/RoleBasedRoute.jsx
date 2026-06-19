import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

/**
 * Restricts access to a route based on the authenticated user's role.
 *
 * @param {string[]} allowedRoles - roles permitted to access the wrapped route
 */
const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { role } = useAuth();

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
};

export default RoleBasedRoute;
