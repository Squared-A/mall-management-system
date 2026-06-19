import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useForm } from '../../hooks/useForm';
import TextInput from '../../components/forms/TextInput';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';
import { isRequired, isValidPassword, passwordsMatch } from '../../utils/validators';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const { values, errors, handleChange, handleSubmit } = useForm(
    { password: '', confirmPassword: '' },
    {
      password: [
        (v) => (!isRequired(v) ? 'Password is required' : null),
        (v) => (!isValidPassword(v) ? 'Password must be at least 8 characters' : null),
      ],
      confirmPassword: [
        (v, vals) => (!passwordsMatch(vals.password, v) ? 'Passwords do not match' : null),
      ],
    },
    async (vals) => {
      if (!token) {
        toast.error('Invalid or missing reset token');
        return;
      }
      setLoading(true);
      try {
        await authService.resetPassword({ token, password: vals.password });
        setDone(true);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    }
  );

  if (done) {
    return (
      <div className="animate-fadeIn text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
          <CheckCircle className="h-8 w-8 text-success-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Password reset!</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
        <Button className="mt-8 w-full" onClick={() => navigate(ROUTES.LOGIN)}>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Set new password</h2>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="relative">
          <TextInput
            label="New password"
            name="password"
            type={showPass ? 'text' : 'password'}
            icon={Lock}
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            tabIndex={-1}
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <TextInput
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" className="w-full" loading={loading}>
          Reset password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
