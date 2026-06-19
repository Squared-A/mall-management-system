import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import TextInput from '../../components/forms/TextInput';
import { Checkbox } from '../../components/forms/Checkbox';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';
import { isRequired, isValidEmail } from '../../utils/validators';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '', remember: true },
    {
      email: [
        (v) => (!isRequired(v) ? 'Email is required' : null),
        (v) => (!isValidEmail(v) ? 'Enter a valid email address' : null),
      ],
      password: [(v) => (!isRequired(v) ? 'Password is required' : null)],
    },
    async (vals) => {
      await login(vals);
      const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(redirectTo, { replace: true });
    }
  );

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Welcome back</h2>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        Sign in to your account to manage your mall operations.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <TextInput
          label="Email address"
          name="email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <div>
          <div className="relative">
            <TextInput
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="remember"
            checked={values.remember}
            onChange={handleChange}
          />
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-medium text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have a mall account?{' '}
        <Link to={ROUTES.REGISTER_MALL} className="font-medium text-primary-600 hover:underline">
          Register your mall
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Demo credentials</p>
        <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <li>Super Admin: admin@mms.com / password123</li>
          <li>Mall Manager: manager@mms.com / password123</li>
          <li>Tenant: tenant@mms.com / password123</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
