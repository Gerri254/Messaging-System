"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const database_1 = __importDefault(require("../config/database"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const emailService_1 = require("./emailService");
class AuthService {
    async register(data) {
        const existingUser = await database_1.default.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        const user = await database_1.default.user.create({
            data: {
                email: data.email.toLowerCase(),
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isVerified: true,
                emailVerifiedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const verificationToken = (0, jwt_1.generateToken)({ userId: user.id, email: user.email });
        try {
            await emailService_1.emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
        return {
            user,
            message: 'User registered successfully. Please check your email for verification.',
        };
    }
    async login(data) {
        const user = await database_1.default.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await (0, password_1.comparePassword)(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        if (!user.isVerified) {
            throw new Error('Please verify your email address before logging in');
        }
        const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email });
        await database_1.default.userSession.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        const { password, passwordResetToken, passwordResetExpires, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token,
        };
    }
    async verifyEmail(token) {
        try {
            const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user) {
                throw new Error('Invalid verification token');
            }
            if (user.isVerified) {
                return { message: 'Email already verified' };
            }
            await database_1.default.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    emailVerifiedAt: new Date(),
                },
            });
            return { message: 'Email verified successfully' };
        }
        catch (error) {
            throw new Error('Invalid or expired verification token');
        }
    }
    async resendVerification(email) {
        const user = await database_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.isVerified) {
            throw new Error('Email already verified');
        }
        const verificationToken = (0, jwt_1.generateToken)({ userId: user.id, email: user.email });
        await emailService_1.emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);
        return { message: 'Verification email sent successfully' };
    }
    async forgotPassword(email) {
        const user = await database_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return { message: 'If an account with that email exists, a password reset link has been sent.' };
        }
        const resetToken = (0, jwt_1.generatePasswordResetToken)();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            },
        });
        try {
            await emailService_1.emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
        }
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }
    async resetPassword(token, newPassword) {
        const user = await database_1.default.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new Error('Invalid or expired reset token');
        }
        const hashedPassword = await (0, password_1.hashPassword)(newPassword);
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
        await database_1.default.userSession.deleteMany({
            where: { userId: user.id },
        });
        return { message: 'Password reset successfully' };
    }
    async logout(token) {
        await database_1.default.userSession.delete({
            where: { token },
        }).catch(() => { });
        return { message: 'Logged out successfully' };
    }
    async updateProfile(userId, data) {
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                isVerified: true,
                emailVerifiedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return updatedUser;
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map