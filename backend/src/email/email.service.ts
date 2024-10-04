import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'in-v3.mailjet.com',
            port: 587,
            auth: {
                user: process.env.MAILJET_API_KEY,
                pass: process.env.MAILJET_SECRET_KEY,
            },
        });
    }

    async sendVerificationEmail(to: string, link: string) {
        const mailOptions = {
            from: 'webmaster@vivieng.com',
            to: to,
            subject: 'Manga Hive - Verify Your Email',
            html: `<p>Click this link to verify your email: <a href="${link}">Verify</a></p>`,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            Logger.log(`Email sent: ${info.response}`);
        } catch (error) {
            Logger.error(`Error sending email: ${error.message}`);
        }
    }

    async sendPasswordResetEmail(to: string, link: string) {
        const mailOptions = {
            from: 'webmaster@vivieng.com',
            to: to,
            subject: 'Manga Hive - Reset Your Password',
            html: `<p>Click this link to reset your password: <a href="${link}">Reset</a></p>`,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            Logger.log(`Email sent: ${info.response}`);
        } catch (error) {
            Logger.error(`Error sending email: ${error.message}`);
        }
    }
}