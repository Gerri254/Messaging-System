declare class EmailService {
    private transporter;
    constructor();
    sendVerificationEmail(email: string, token: string, firstName: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void>;
    sendWelcomeEmail(email: string, firstName: string): Promise<void>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map