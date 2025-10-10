import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import appConfig from '../config/app.config';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail-queue') private queue: Queue,
    private mailerService: MailerService,
  ) { }

  async sendMemberInvitation({ user, member, url }) {
    try {
      const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
      const subject = `${user.fname} is inviting you to ${appConfig().app.name}`;

      // add to queue
      await this.queue.add('sendMemberInvitation', {
        to: member.email,
        from: from,
        subject: subject,
        template: 'member-invitation',
        context: {
          user: user,
          member: member,
          url: url,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  // send otp code for email verification
  async sendOtpCodeToEmail({ name, email, otp }) {
    try {
      const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
      const subject = 'Email Verification';

      // add to queue
      await this.queue.add('sendOtpCodeToEmail', {
        to: email,
        from: from,
        subject: subject,
        template: 'email-verification',
        context: {
          name: name,
          otp: otp,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendVerificationLink(params: {
    email: string;
    name: string;
    token: string;
  }) {
    try {
      console.log('📧 Preparing to send verification email to:', params.email);

      // Use backend URL for verification (GET endpoint)
      // const backendUrl = appConfig().app.url || process.env.APP_URL || 'http://localhost:4080';
      // console.log('🔗 Backend URL:', backendUrl);

      const verificationLink = `${appConfig().app.client_app_url}/email-verify?token=${params.token}&email=${params.email}&name=${params.name}`;
      console.log('🔗 Verification link:', verificationLink);

      // add to queue
      console.log('📬 Adding email to queue...');
      await this.queue.add('sendVerificationLink', {
        to: params.email,
        subject: 'Verify Your Email',
        template: './verification-link',
        context: {
          name: params.name,
          verificationLink,
        },
      });
      console.log('✅ Email added to queue successfully!');
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Stack trace:', error.stack);
      throw error; // Re-throw so caller knows it failed
    }
  }
}
