export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare const generateToken: (payload: Omit<JwtPayload, "iat" | "exp">) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const generatePasswordResetToken: () => string;
export declare const verifyPasswordResetToken: (token: string) => boolean;
//# sourceMappingURL=jwt.d.ts.map