import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (!transporter) {
    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
      return null;
    }
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  }
  return transporter;
}

export async function sendVerificationEmail(to, verificationLink) {
  const transport = getTransporter();
  if (!transport) {
    throw new Error('SMTP is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  await transport.sendMail({
    from: env.smtpFrom,
    to,
    subject: 'Verify your email for AIRA-AI',
    html: `<p>Welcome to AIRA-AI.</p><p>Click to verify your email:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
  });
}
