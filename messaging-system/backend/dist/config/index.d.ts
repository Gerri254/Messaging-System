export declare const config: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly frontendUrl: string;
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
    };
    readonly database: {
        readonly url: string | undefined;
    };
    readonly redis: {
        readonly url: string;
    };
    readonly twilio: {
        readonly accountSid: string | undefined;
        readonly authToken: string | undefined;
        readonly phoneNumber: string | undefined;
    };
    readonly email: {
        readonly host: string;
        readonly port: number;
        readonly secure: boolean;
        readonly user: string | undefined;
        readonly password: string | undefined;
        readonly from: string;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
    readonly bcrypt: {
        readonly saltRounds: number;
    };
    readonly cors: {
        readonly allowedOrigins: string[];
    };
    readonly session: {
        readonly secret: string;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map