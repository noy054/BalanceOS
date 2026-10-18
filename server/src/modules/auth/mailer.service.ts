import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly config: ConfigService) {}

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST');

    if (!host) {
      const isProduction = this.config.get('NODE_ENV') === 'production';
      if (isProduction) {
        this.logger.error(
          'SMTP_HOST is not configured. Password reset email could not be sent.',
        );
      } else {
        this.logger.debug(`[DEV] Password reset token for ${to}: ${token}`);
      }
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get('SMTP_PORT') ?? 587),
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    const from =
      this.config.get<string>('SMTP_FROM') ??
      'BalanceOS <noreply@balanceos.com>';

    await transporter.sendMail({
      from,
      to,
      subject: 'Reset your BalanceOS password',
      text: [
        'You requested a password reset for your BalanceOS account.',
        '',
        'Your reset code:',
        token,
        '',
        'Enter this code in the app to set a new password.',
        'This code expires in 1 hour.',
        '',
        'If you did not request a password reset, ignore this email.',
      ].join('\n'),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
          <p style="font-size: 11px; font-weight: 800; letter-spacing: 2.8px; color: #1FAE5B; text-transform: uppercase; margin: 0 0 24px;">BalanceOS</p>
          <h1 style="font-size: 24px; font-weight: 900; color: #101510; margin: 0 0 8px; letter-spacing: -0.5px;">Reset your password</h1>
          <p style="font-size: 15px; color: rgba(16,21,16,0.68); margin: 0 0 28px; line-height: 1.5;">Enter the code below in the BalanceOS app to set a new password.</p>
          <div style="background: rgba(11,13,11,0.05); border-radius: 10px; padding: 20px 24px; font-family: 'Courier New', monospace; font-size: 15px; letter-spacing: 1.5px; color: #101510; word-break: break-all; line-height: 1.6; border: 1px solid rgba(16,21,16,0.10);">
            ${token}
          </div>
          <p style="font-size: 13px; color: rgba(16,21,16,0.42); margin: 20px 0 0; line-height: 1.5;">This code expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });
  }
}
