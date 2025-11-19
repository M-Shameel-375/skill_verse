// Email service
// ============================================
// EMAIL SERVICE
// ============================================

const nodemailer = require('nodemailer');
const config = require('../config/config');
const fs = require('fs').promises;
const path = require('path');

// ============================================
// CREATE TRANSPORTER
// ============================================
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

// ============================================
// SEND EMAIL
// ============================================
const sendEmail = async ({ to, subject, template, data, attachments = [] }) => {
  try {
    const transporter = createTransporter();

    // Get HTML template
    const html = await getEmailTemplate(template, data);

    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// ============================================
// GET EMAIL TEMPLATE
// ============================================
const getEmailTemplate = async (templateName, data) => {
  const templates = {
    'email-verification': emailVerificationTemplate,
    'password-reset': passwordResetTemplate,
    'password-changed': passwordChangedTemplate,
    'welcome': welcomeTemplate,
    'course-enrollment': courseEnrollmentTemplate,
    'session-registration': sessionRegistrationTemplate,
    'skill-exchange-request': skillExchangeRequestTemplate,
    'skill-exchange-accepted': skillExchangeAcceptedTemplate,
    'certificate-issued': certificateIssuedTemplate,
    'payment-success': paymentSuccessTemplate,
    'account-deleted': accountDeletedTemplate,
  };

  const templateFunction = templates[templateName];
  
  if (!templateFunction) {
    throw new Error(`Template ${templateName} not found`);
  }

  return templateFunction(data);
};

// ============================================
// EMAIL TEMPLATES
// ============================================

// Email Verification Template
const emailVerificationTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SkillVerse</h1>
      <p>Welcome to the Learning Platform</p>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>Thank you for registering with SkillVerse! Please verify your email address to get started.</p>
      <p>Click the button below to verify your email:</p>
      <a href="${data.verificationUrl}" class="button">Verify Email</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${data.verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Password Reset Template
const passwordResetTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${data.resetUrl}" class="button">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${data.resetUrl}</p>
      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Password Changed Template
const passwordChangedTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Changed</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Changed Successfully</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <div class="success">
        <p>✅ Your password has been changed successfully.</p>
      </div>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <p>For security reasons, you may need to log in again on all your devices.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Welcome Template
const welcomeTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to SkillVerse</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .feature { background: white; padding: 15px; border-radius: 5px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to SkillVerse!</h1>
      <p>Your journey to mastering new skills starts here</p>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>We're thrilled to have you join our community of learners and educators!</p>
      <div class="features">
        <div class="feature">📚 Browse Courses</div>
        <div class="feature">🎓 Learn Skills</div>
        <div class="feature">🤝 Skill Exchange</div>
        <div class="feature">🏆 Earn Badges</div>
      </div>
      <p>Ready to get started?</p>
      <a href="${config.frontend.url}/courses" class="button">Explore Courses</a>
      <a href="${config.frontend.url}/profile" class="button">Complete Profile</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Course Enrollment Template
const courseEnrollmentTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Course Enrollment Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .course-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Enrollment Successful!</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>Congratulations! You've successfully enrolled in:</p>
      <div class="course-info">
        <h3>${data.courseTitle}</h3>
        <p><strong>Instructor:</strong> ${data.instructorName}</p>
        <p><strong>Start Learning:</strong> Anytime</p>
      </div>
      <a href="${data.courseUrl}" class="button">Start Learning Now</a>
      <p>Happy learning! 🚀</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Session Registration Template
const sessionRegistrationTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Live Session Registration</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .session-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📺 Live Session Registration</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>You're registered for the upcoming live session!</p>
      <div class="session-details">
        <h3>${data.sessionTitle}</h3>
        <p>📅 <strong>Date:</strong> ${new Date(data.scheduledAt).toLocaleDateString()}</p>
        <p>🕒 <strong>Time:</strong> ${new Date(data.scheduledAt).toLocaleTimeString()}</p>
      </div>
      <a href="${data.joinUrl}" class="button">Add to Calendar</a>
      <p><strong>Join Link:</strong> You'll receive the join link 15 minutes before the session starts.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Skill Exchange Request Template
const skillExchangeRequestTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Skill Exchange Request</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .skill-box { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤝 New Skill Exchange Request</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p><strong>${data.requesterName}</strong> wants to exchange skills with you!</p>
      <div class="skill-box">
        <p><strong>They offer:</strong> ${data.offeredSkill}</p>
        <p><strong>They want to learn:</strong> ${data.requestedSkill}</p>
      </div>
      <p>Review their profile and decide if you'd like to connect:</p>
      <a href="${data.exchangeUrl}" class="button">View Request</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Skill Exchange Accepted Template
const skillExchangeAcceptedTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Skill Exchange Request Accepted</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Request Accepted!</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>Great news! <strong>${data.providerName}</strong> has accepted your skill exchange request.</p>
      <p>You can now schedule your first session and start learning together!</p>
      <a href="${data.exchangeUrl}" class="button">Schedule Session</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Certificate Issued Template
const certificateIssuedTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate Issued</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #ffd700; color: #333; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Congratulations!</h1>
      <h2>Certificate Earned</h2>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>Congratulations on completing <strong>${data.courseName}</strong>!</p>
      <p>Your certificate is ready to download and share with the world.</p>
      <a href="${data.certificateUrl}" class="button">Download Certificate</a>
      <p>Share your achievement on social media and show off your new skills!</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Payment Success Template
const paymentSuccessTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Successful</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .receipt { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Successful</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>Thank you for your payment! Here's your receipt:</p>
      <div class="receipt">
        <p><strong>Amount Paid:</strong> $${data.amount}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p>You can now access your purchased content.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Account Deleted Template
const accountDeletedTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Account Deleted</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6c757d; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Deleted</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.name},</h2>
      <p>Your SkillVerse account has been successfully deleted.</p>
      <p>We're sorry to see you go! If you change your mind, you're always welcome to create a new account.</p>
      <p>Thank you for being part of our community.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SkillVerse. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// SEND BULK EMAILS
// ============================================
const sendBulkEmails = async (emails) => {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return { successful, failed, total: emails.length };
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  sendEmail,
  sendBulkEmails,
};