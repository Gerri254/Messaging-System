import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { authValidation } from '../utils/validation';

const router = Router();

router.post('/register', validate(authValidation.register), authController.register);

router.post('/login', validate(authValidation.login), authController.login);

router.get('/verify-email', authController.verifyEmail);

router.post('/resend-verification', validate(authValidation.forgotPassword), authController.resendVerification);

router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);

router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

router.post('/logout', authenticate, authController.logout);

router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', authenticate, validate(authValidation.updateProfile), authController.updateProfile);

export default router;