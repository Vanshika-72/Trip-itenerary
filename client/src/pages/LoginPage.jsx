import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, Lock, Compass, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (email, pwd = 'Password123!') => {
    setValue('email', email);
    setValue('password', pwd);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-forest-800 text-sand-200 items-center justify-center shadow-lg">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold font-serif text-forest-950">
          Welcome back
        </h2>
        <p className="text-xs text-charcoal-500">
          Sign in to access your travel itineraries and shared trips
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-sand-200 space-y-6">
          {/* Error Message */}
          {(errorMessage || authError) && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              required
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              {...register('password', {
                required: 'Password is required',
              })}
              error={errors.password?.message}
            />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Sign In
            </Button>
          </form>

          {/* Demo Account Quick-Fill Buttons */}
          <div className="pt-4 border-t border-sand-200 space-y-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-400 text-center">
              Quick-Fill Demo Users
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('alex@tripmate.io')}
                className="py-1.5 px-2 bg-sand-100 hover:bg-sand-200 text-charcoal-800 rounded-lg text-xs font-semibold transition"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('sarah@tripmate.io')}
                className="py-1.5 px-2 bg-sand-100 hover:bg-sand-200 text-charcoal-800 rounded-lg text-xs font-semibold transition"
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('marcus@tripmate.io')}
                className="py-1.5 px-2 bg-sand-100 hover:bg-sand-200 text-charcoal-800 rounded-lg text-xs font-semibold transition"
              >
                Viewer
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-charcoal-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-forest-800 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
