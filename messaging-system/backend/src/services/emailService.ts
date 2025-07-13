import nodemailer from 'nodemailer';
import config from '../config';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Messaging System!</h1>
          </div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>Thank you for registering with our messaging system. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>If you can't click the button, copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Messaging System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Verify Your Email Address',
      html: htmlContent,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>We received a request to reset your password for your Messaging System account.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If you can't click the button, copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Messaging System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Reset Your Password',
      html: htmlContent,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Messaging System</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #4ecdc4; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4ecdc4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome aboard, ${firstName}!</h1>
          </div>
          <div class="content">
            <p>Congratulations! Your email has been verified and your account is now active.</p>
            <p>You now have access to our powerful messaging platform with features including:</p>
            
            <div class="feature">
              <h3>📱 Bulk SMS Messaging</h3>
              <p>Send messages to thousands of contacts instantly</p>
            </div>
            
            <div class="feature">
              <h3>👥 Contact Management</h3>
              <p>Organize your contacts into groups for targeted messaging</p>
            </div>
            
            <div class="feature">
              <h3>📝 Message Templates</h3>
              <p>Create reusable templates with dynamic variables</p>
            </div>
            
            <div class="feature">
              <h3>📊 Analytics & Reports</h3>
              <p>Track delivery rates and engagement metrics</p>
            </div>
            
            <a href="${config.frontendUrl}/dashboard" class="button">Get Started</a>
            
            <p>If you need any help getting started, don't hesitate to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Messaging System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Welcome to Messaging System!',
      html: htmlContent,
    });
  }
}

export const emailService = new EmailService();