import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { authApi } from '../../utils/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setIsLoading(false);
      setError('Invalid verification token');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      await authApi.verifyEmail(token);
      setIsVerified(true);
      toast.success('Email verified successfully!');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Email verification failed');
      toast.error('Email verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card variant="glass" className="bg-white bg-opacity-95">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Verifying your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isVerified) {
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Email verified!
            </h2>
            <p className="mt-2 text-gray-600">
              Your email address has been successfully verified. You can now access all features of MessageHub.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card variant="glass" className="bg-white bg-opacity-95 text-center">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">✨</div>
                    <div className="text-sm text-gray-600">Account Ready</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">📱</div>
                    <div className="text-sm text-gray-600">Send SMS</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">📊</div>
                    <div className="text-sm text-gray-600">Analytics</div>
                  </div>
                </div>
                
                <Link to="/login" className="block">
                  <Button className="w-full" size="lg">
                    Continue to Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verification failed
          </h2>
          <p className="mt-2 text-gray-600">
            {error || 'This verification link is invalid or has expired.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="glass" className="bg-white bg-opacity-95 text-center">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Need a new verification link? We can resend it to your email address.
              </p>
              
              <div className="space-y-3">
                <Link to="/login" className="block">
                  <Button variant="secondary" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
                
                <Link to="/register" className="block">
                  <Button variant="ghost" className="w-full">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;