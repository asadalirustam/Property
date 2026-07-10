const nodemailer = require('nodemailer');

const isMailConfigured = 
  process.env.EMAIL_USERNAME && 
  process.env.EMAIL_PASSWORD;

let transporter;

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else {
  console.log('SMTP credentials missing. Email service will run in Console/Mock mode.');
}

const sendEmail = async ({ to, subject, html, text }) => {
  if (!isMailConfigured) {
    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content (HTML preview): ${html || text}`);
    console.log('========================================================\n');
    return { mock: true, messageId: `mock_${Date.now()}` };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Real Estate Platform" <noreply@propertyfinder.com>',
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendEmail,
  isMailConfigured
};
