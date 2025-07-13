import { User } from '@prisma/client';
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: Omit<User, 'password' | 'passwordResetToken' | 'passwordResetExpires'>;
    token: string;
}
declare class AuthService {
    register(data: RegisterData): Promise<{
        user: Omit<User, 'password' | 'passwordResetToken' | 'passwordResetExpires'>;
        message: string;
    }>;
    login(data: LoginData): Promise<AuthResponse>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    logout(token: string): Promise<{
        message: string;
    }>;
    updateProfile(userId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>): Promise<Omit<User, 'password' | 'passwordResetToken' | 'passwordResetExpires'>>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=authService.d.ts.map