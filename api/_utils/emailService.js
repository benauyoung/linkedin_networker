// Email service for EVENT CONNECT
import nodemailer from 'nodemailer';

// Create transporter for sending emails
let transporter = null;

/**
 * Initialize the email transporter
 * Uses environment variables or default test account
 */
export async function initializeEmailTransporter() {
  if (transporter) {
    return transporter;
  }

  // If email config is provided in environment variables
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    console.log('Email service initialized with provided credentials');
    return transporter;
  } 
  
  // For development: Create a test account on ethereal.email
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  console.log('Email service initialized with test account');
  console.log('Test email account:', testAccount.user);
  return transporter;
}

/**
 * Send emails to all attendees of an event
 * @param {Object} event - The event object
 * @param {Array} attendees - Array of attendee objects
 * @param {String} emailType - Type of email to send (confirmation, reminder, followup)
 */
export async function sendEventEmails(event, attendees, emailType = 'followup') {
  try {
    if (!transporter) {
      await initializeEmailTransporter();
    }
    
    // Get email template based on type
    const template = getEmailTemplate(event, emailType);
    
    // Send email to each attendee
    const emailPromises = attendees.map(attendee => {
      const personalizedContent = template.html.replace('{{NAME}}', attendee.name);
      
      return transporter.sendMail({
        from: `"EVENT CONNECT" <${process.env.EMAIL_FROM || 'eventconnect@example.com'}>`,
        to: attendee.email,
        subject: template.subject,
        html: personalizedContent,
      });
    });
    
    const results = await Promise.all(emailPromises);
    
    // For test accounts, log preview URLs
    results.forEach((info, index) => {
      if (info.messageId && nodemailer.getTestMessageUrl) {
        console.log(`Email sent to ${attendees[index].email}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    });
    
    return {
      success: true,
      count: results.length,
      message: `${results.length} emails sent successfully`
    };
  } catch (error) {
    console.error('Error sending emails:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mark an event as completed and send follow-up emails
 * @param {String} eventId - The ID of the event to mark as completed
 * @param {Object} dbConnection - Database connection with models
 */
export async function completeEventAndSendEmails(eventId, dbConnection) {
  try {
    const { Event, Attendee } = dbConnection;
    
    // Find event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }
    
    // Mark event as completed
    event.isCompleted = true;
    await event.save();
    
    // Find all attendees for this event
    const attendees = await Attendee.find({ eventId: event.eventCode });
    
    if (attendees.length === 0) {
      return {
        success: true,
        event: event,
        message: 'Event marked as completed, but no attendees found to email'
      };
    }
    
    // Send follow-up emails
    const emailResult = await sendEventEmails(event, attendees, 'followup');
    
    return {
      success: true,
      event: event,
      emailsSent: emailResult.count,
      message: `Event marked as completed and ${emailResult.count} follow-up emails sent`
    };
  } catch (error) {
    console.error('Error completing event:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get email template based on type
 * @param {Object} event - The event object
 * @param {String} type - Type of email (confirmation, reminder, followup)
 * @returns {Object} Email template with subject and HTML content
 */
function getEmailTemplate(event, type) {
  // Base style for all emails
  const baseStyle = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0047AB; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 10px 20px; background-color: #0047AB; color: white; 
              text-decoration: none; border-radius: 4px; margin-top: 15px; }
  `;
  
  switch (type) {
    case 'followup':
      return {
        subject: `Thank you for attending ${event.name}`,
        html: `
          <html>
            <head>
              <style>${baseStyle}</style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Thank You for Attending!</h1>
                </div>
                <div class="content">
                  <p>Hello {{NAME}},</p>
                  <p>Thank you for attending <strong>${event.name}</strong> at ${event.location} on ${new Date(event.date).toLocaleDateString()}.</p>
                  <p>We hope you enjoyed the event and made valuable connections. We'd love to hear your feedback and see you at future events!</p>
                  <p>Feel free to connect with other attendees on your networking platforms.</p>
                  <a href="#" class="button">View Event Photos</a>
                </div>
                <div class="footer">
                  <p>This email was sent by EVENT CONNECT. To unsubscribe, click <a href="#">here</a>.</p>
                  <p>&copy; 2025 EVENT CONNECT. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
    
    case 'reminder':
      return {
        subject: `Reminder: ${event.name} is tomorrow!`,
        html: `
          <html>
            <head>
              <style>${baseStyle}</style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Event Reminder</h1>
                </div>
                <div class="content">
                  <p>Hello {{NAME}},</p>
                  <p>This is a friendly reminder that <strong>${event.name}</strong> is happening tomorrow at ${event.location}.</p>
                  <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                  <p>Time: ${new Date(event.date).toLocaleTimeString()}</p>
                  <p>Location: ${event.location}</p>
                  <p>We look forward to seeing you there!</p>
                  <a href="#" class="button">View Event Details</a>
                </div>
                <div class="footer">
                  <p>This email was sent by EVENT CONNECT. To unsubscribe, click <a href="#">here</a>.</p>
                  <p>&copy; 2025 EVENT CONNECT. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
    
    case 'confirmation':
    default:
      return {
        subject: `Registration Confirmed: ${event.name}`,
        html: `
          <html>
            <head>
              <style>${baseStyle}</style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Registration Confirmed</h1>
                </div>
                <div class="content">
                  <p>Hello {{NAME}},</p>
                  <p>Your registration for <strong>${event.name}</strong> has been confirmed!</p>
                  <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                  <p>Time: ${new Date(event.date).toLocaleTimeString()}</p>
                  <p>Location: ${event.location}</p>
                  <p>We look forward to seeing you at the event. If you have any questions, please feel free to contact us.</p>
                  <a href="#" class="button">Add to Calendar</a>
                </div>
                <div class="footer">
                  <p>This email was sent by EVENT CONNECT. To unsubscribe, click <a href="#">here</a>.</p>
                  <p>&copy; 2025 EVENT CONNECT. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
  }
}
