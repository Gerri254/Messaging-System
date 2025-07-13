import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { authApi } from '../../utils/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="max-w-md w-full space-y-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to{' '}
              <span className="font-medium text-gray-900">{getValues('email')}</span>
            </p>
          </motion.div>

          <Card variant="glass" className="bg-white bg-opacity-95 text-center">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or click below to resend.
              </p>
              <Button
                onClick={() => setIsEmailSent(false)}
                variant="secondary"
                className="w-full"
              >
                Resend email
              </Button>
            </div>
          </Card>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Link>
          </div>
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="glass" className="bg-white bg-opacity-95">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                size="lg"
              >
                Send reset link
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
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;