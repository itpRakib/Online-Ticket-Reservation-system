const nodemailer = require('nodemailer');

// Set up Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Generates the clean HTML email template for the OTP.
 * @param {string} otp - The 6-digit OTP code.
 * @returns {string} HTML content.
 */
function getEmailTemplate(otp) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verification Code</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #334155;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 30px 20px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 30px;
        }
        .otp-container {
          display: inline-block;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 6px;
          padding: 16px 32px;
          border-radius: 8px;
          margin-bottom: 30px;
          font-family: 'Courier New', Courier, monospace;
        }
        .warning {
          font-size: 13px;
          color: #64748b;
          margin-top: 20px;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Identity Verification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Please use the following verification code to complete your authorization process. This code is valid for <strong>5 minutes</strong>.</p>
          <div class="otp-container">${otp}</div>
          <p class="warning">If you did not request this code, please ignore this email or secure your account.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Ticket Reservation System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends the OTP email.
 * @param {string} toEmail - Recipient email.
 * @param {string} otp - The generated OTP code.
 * @returns {Promise<any>}
 */
async function sendOTPEmail(toEmail, otp) {
  const mailOptions = {
    from: `"Ticket Verification" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Verification Code',
    text: `Your Verification Code is: ${otp}. This code is valid for 5 minutes.`,
    html: getEmailTemplate(otp),
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };
