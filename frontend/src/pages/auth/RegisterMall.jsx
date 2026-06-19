import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import TextInput from '../../components/forms/TextInput';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';
import {
  isRequired,
  isValidEmail,
  isValidPassword,
  passwordsMatch,
  isValidPhone,
} from '../../utils/validators';

const RegisterMall = () => {
  const { registerMall, loading } = useAuth();
  const navigate = useNavigate();

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      mallName: '',
      ownerName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    {
      mallName: [(v) => (!isRequired(v) ? 'Mall name is required' : null)],
      ownerName: [(v) => (!isRequired(v) ? 'Owner name is required' : null)],
      email: [
        (v) => (!isRequired(v) ? 'Email is required' : null),
        (v) => (!isValidEmail(v) ? 'Enter a valid email address' : null),
      ],
      phone: [
        (v) => (!isRequired(v) ? 'Phone number is required' : null),
        (v) => (!isValidPhone(v) ? 'Enter a valid phone number' : null),
      ],
      password: [
        (v) => (!isRequired(v) ? 'Password is required' : null),
        (v) => (!isValidPassword(v) ? 'Password must be at least 8 characters' : null),
      ],
      confirmPassword: [
        (v, vals) => (!passwordsMatch(vals.password, v) ? 'Passwords do not match' : null),
      ],
    },
    async (vals) => {
      await registerMall(vals);
      navigate(ROUTES.LOGIN);
    }
  );

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Register your mall</h2>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        Create your SaaS account and start managing your mall in minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <TextInput
          label="Mall name"
          name="mallName"
          icon={Building2}
          placeholder="Skyline Grand Mall"
          value={values.mallName}
          onChange={handleChange}
          error={errors.mallName}
          required
        />

        <TextInput
          label="Owner full name"
          name="ownerName"
          icon={User}
          placeholder="Jane Doe"
          value={values.ownerName}
          onChange={handleChange}
          error={errors.ownerName}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Email address"
            name="email"
            type="email"
            icon={Mail}
            placeholder="owner@example.com"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <TextInput
            label="Phone number"
            name="phone"
            icon={Phone}
            placeholder="+1 555 123 4567"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <TextInput
            label="Confirm password"
            name="confirmPassword"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterMall;
