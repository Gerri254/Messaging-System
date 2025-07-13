import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { authApi } from '../../utils/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = password ? getPasswordStrength(password) : 0;

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <Card>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl">
                  <Lock className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
              <p className="text-gray-600">
                This password reset link is invalid or has expired.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block text-primary-600 hover:text-primary-500"
              >
                Request a new reset link
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="max-w-md w-full space-y-8 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="glass" className="bg-white bg-opacity-95">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Input
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    validate: {
                      hasUpperCase: (value) =>
                        /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                      hasLowerCase: (value) =>
                        /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                      hasNumber: (value) =>
                        /[0-9]/.test(value) || 'Password must contain at least one number',
                      hasSpecialChar: (value) =>
                        /[^A-Za-z0-9]/.test(value) || 'Password must contain at least one special character',
                    },
                  })}
                />

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1 flex-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < passwordStrength
                                ? passwordStrength <= 2
                                  ? 'bg-red-500'
                                  : passwordStrength <= 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>

                    {/* Password Requirements */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center text-xs">
                        <Check 
                          className={`w-3 h-3 mr-2 ${
                            password.length >= 8 ? 'text-green-500' : 'text-gray-300'
                          }`} 
                        />
                        <span className={password.length >= 8 ? 'text-green-700' : 'text-gray-500'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Check 
                          className={`w-3 h-3 mr-2 ${
                            /[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'
                          }`} 
                        />
                        <span className={/[A-Z]/.test(password) ? 'text-green-700' : 'text-gray-500'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Check 
                          className={`w-3 h-3 mr-2 ${
                            /[0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'
                          }`} 
                        />
                        <span className={/[0-9]/.test(password) ? 'text-green-700' : 'text-gray-500'}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Check 
                          className={`w-3 h-3 mr-2 ${
                            /[^A-Za-z0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'
                          }`} 
                        />
                        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-green-700' : 'text-gray-500'}>
                          One special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm new password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                size="lg"
              >
                Reset password
              </Button>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;