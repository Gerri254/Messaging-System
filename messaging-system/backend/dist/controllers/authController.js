"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const password_1 = require("../utils/password");
exports.authController = {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone } = req.body;
            const passwordValidation = (0, password_1.validatePasswordStrength)(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: 'Password does not meet requirements',
                    details: passwordValidation.errors,
                });
            }
            const result = await authService_1.authService.register({
                email,
                password,
                firstName,
                lastName,
                phone,
            });
            return res.status(201).json({
                message: result.message,
                user: result.user,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Registration failed',
            });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService_1.authService.login({ email, password });
            return res.status(200).json({
                message: 'Login successful',
                user: result.user,
                token: result.token,
            });
        }
        catch (error) {
            return res.status(401).json({
                error: error.message || 'Login failed',
            });
        }
    },
    async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            if (!token || typeof token !== 'string') {
                return res.status(400).json({
                    error: 'Verification token is required',
                });
            }
            const result = await authService_1.authService.verifyEmail(token);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Email verification failed',
            });
        }
    },
    async resendVerification(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    error: 'Email is required',
                });
            }
            const result = await authService_1.authService.resendVerification(email);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to resend verification email',
            });
        }
    },
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await authService_1.authService.forgotPassword(email);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Password reset request failed',
            });
        }
    },
    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            const passwordValidation = (0, password_1.validatePasswordStrength)(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: 'Password does not meet requirements',
                    details: passwordValidation.errors,
                });
            }
            const result = await authService_1.authService.resetPassword(token, password);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Password reset failed',
            });
        }
    },
    async logout(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.substring(7);
            if (token) {
                await authService_1.authService.logout(token);
            }
            return res.status(200).json({
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            return res.status(200).json({
                message: 'Logged out successfully',
            });
        }
    },
    async getProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                });
            }
            return res.status(200).json({
                user: req.user,
            });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get profile',
            });
        }
    },
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                });
            }
            const { firstName, lastName, phone } = req.body;
            const updatedUser = await authService_1.authService.updateProfile(req.user.id, {
                firstName,
                lastName,
                phone,
            });
            return res.status(200).json({
                message: 'Profile updated successfully',
                user: updatedUser,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Profile update failed',
            });
        }
    },
};
//# sourceMappingURL=authController.js.map