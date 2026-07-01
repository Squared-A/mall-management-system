import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import TextInput from '../../components/forms/TextInput';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';
import { isRequired, isValidEmail } from '../../utils/validators';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '' },
    {
      email: [
        (v) => (!isRequired(v) ? 'Email is required' : null),
        (v) => (!isValidEmail(v) ? 'Enter a valid email address' : null),
      ],
    },
    async (vals) => {
      setLoading(true);
      try {
        await authService.forgotPassword(vals.email);
        setSent(true);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to send reset email');
      } finally {
        setLoading(false);
      }
    }
  );

  if (sent) {
    return (
      <div className="animate-fadeIn text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
          <CheckCircle className="h-8 w-8 text-success-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Check your email</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We've sent password reset instructions to <strong>{values.email}</strong>. Check your
          inbox and follow the link to reset your password.
        </p>
        <p className="mt-4 text-xs text-gray-400">
          Didn't receive it? Check your spam folder or{' '}
          <button onClick={() => setSent(false)} className="text-primary-600 hover:underline">
            try a different email
          </button>
          .
        </p>
        <Link to={ROUTES.LOGIN} className="mt-8 btn-outline btn inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Forgot your password?</h2>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        Enter your email and we'll send you a link to reset your password.
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

        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
