const nodemailer = require('nodemailer');
const logger = require('./logger');

// Configurable email templates
const emailTemplates = {
  followUp: (event, attendee) => ({
    subject: `Thank you for attending ${event.name}!`,
    text: `
Hello ${attendee.name || 'there'},

Thank you for attending our event "${event.name}" at ${event.location}.

We hope you enjoyed the event and made valuable connections. We would love to hear your feedback!

Best regards,
The EVENT CONNECT Team
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background-color: #0066cc; padding: 15px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">EVENT CONNECT</h1>
  </div>
  
  <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
    <h2 style="color: #0066cc;">Thank you for attending ${event.name}!</h2>
    
    <p>Hello ${attendee.name || 'there'},</p>
    
    <p>Thank you for attending our event "${event.name}" at ${event.location}.</p>
    
    <p>We hope you enjoyed the event and made valuable connections. Here are some highlights:</p>
    
    <ul>
      <li>Event Date: ${new Date(event.date).toLocaleDateString()}</li>
      <li>Location: ${event.location}</li>
      <li>Organizer: ${event.organizer || 'EVENT CONNECT'}</li>
    </ul>
    
    <p>We would love to hear your feedback about the event!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">PROVIDE FEEDBACK</a>
    </div>
    
    <p>Best regards,<br>The EVENT CONNECT Team</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
    <p> 2025 EVENT CONNECT. All rights reserved.</p>
    <p>If you no longer wish to receive emails from us, <a href="#" style="color: #0066cc;">unsubscribe here</a>.</p>
  </div>
</div>
    `
  })
};

class EmailService {
  constructor() {
    this.transporter = null;
    this.defaultFrom = '';
    this.isTestAccount = false;
    this.testAccount = null;
  }

  async initialize() {
    try {
      // Determine if we're in production or development
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction && process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Production: Use real SMTP server
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false // In some environments this might be needed
          }
        });
        
        this.defaultFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        this.isTestAccount = false;
        
        logger.info(`Email service initialized with ${process.env.EMAIL_HOST}`);
      } else {
        // Development: Use Ethereal for testing
        this.testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: this.testAccount.user,
            pass: this.testAccount.pass
          }
        });
        
        this.defaultFrom = `EVENT CONNECT <${this.testAccount.user}>`;
        this.isTestAccount = true;
        
        logger.info('Email service initialized with test account');
        logger.debug(`Test email account: ${this.testAccount.user}`);
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize email service', error);
      return false;
    }
  }

  // Method to send a follow-up email to a single attendee
  async sendFollowUpEmail(attendee, event) {
    if (!this.transporter) {
      await this.initialize();
    }
    
    if (!attendee || !attendee.email) {
      throw new Error('Invalid attendee data: email is required');
    }
    
    if (!event || !event.name) {
      throw new Error('Invalid event data: event name is required');
    }
    
    const template = emailTemplates.followUp(event, attendee);
    
    const mailOptions = {
      from: this.defaultFrom,
      to: attendee.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    };
    
    const info = await this.transporter.sendMail(mailOptions);
    
    // Log the result and return preview URL for test accounts
    if (this.isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info(`Test email sent to ${attendee.email}`, { previewUrl });
      return {
        success: true,
        previewUrl,
        messageId: info.messageId
      };
    }
    
    logger.info(`Email sent to ${attendee.email}`, { messageId: info.messageId });
    return {
      success: true,
      messageId: info.messageId
    };
  }

  async sendEventFollowUpEmails(event, attendees) {
    if (!this.transporter) {
      await this.initialize();
    }
    
    if (!Array.isArray(attendees) || attendees.length === 0) {
      // If no real attendees, create test data in development mode
      if (this.isTestAccount) {
        logger.info('Created test attendees for demonstration');
        attendees = [
          { email: 'test1@example.com', name: 'Test User 1' },
          { email: 'test2@example.com', name: 'Test User 2' }
        ];
      } else {
        logger.warn('No attendees found for event follow-up emails');
        return { success: false, error: 'No attendees found' };
      }
    }
    
    const results = [];
    
    for (const attendee of attendees) {
      if (!attendee.email) {
        logger.warn('Skipping attendee without email address');
        continue;
      }
      
      try {
        const result = await this.sendFollowUpEmail(attendee, event);
        results.push({
          attendee: attendee.email,
          success: true,
          messageId: result.messageId,
          previewUrl: result.previewUrl
        });
      } catch (error) {
        logger.error(`Failed to send email to ${attendee.email}`, error);
        
        results.push({
          attendee: attendee.email,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: results.some(r => r.success),
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      details: results
    };
  }
  
  // Method to verify connection
  async verifyConnection() {
    if (!this.transporter) {
      await this.initialize();
    }
    
    try {
      const verification = await this.transporter.verify();
      return { success: verification, isTestAccount: this.isTestAccount };
    } catch (error) {
      logger.error('SMTP verification failed', error);
      return { success: false, error: error.message };
    }
  }
  
  // Method to send a test email
  async sendTestEmail(to) {
    if (!this.transporter) {
      await this.initialize();
    }
    
    try {
      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: to,
        subject: 'EVENT CONNECT - Test Email',
        text: 'This is a test email from EVENT CONNECT to verify email functionality.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="background-color: #0066cc; padding: 15px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">EVENT CONNECT</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
              <h2 style="color: #0066cc;">Test Email</h2>
              <p>This is a test email from EVENT CONNECT to verify email functionality.</p>
              <p>If you're receiving this, your email configuration is working correctly!</p>
            </div>
          </div>
        `
      });
      
      // For test accounts, show the preview URL
      if (this.isTestAccount) {
        logger.info(`Test email sent to ${to}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        logger.info(`Preview URL: ${previewUrl}`);
        return {
          success: true,
          previewUrl
        };
      }
      
      logger.info(`Test email sent to ${to}`, { messageId: info.messageId });
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error('Failed to send test email', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = EmailService;
