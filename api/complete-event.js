/**
 * Handler for the complete-event endpoint
 * Marks an event as completed and sends follow-up emails to attendees
 */
import { connectToDatabase } from './_utils/mongodb.js';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Helper function to send emails
async function sendFollowUpEmails(event, attendees) {
  console.log(`Sending follow-up emails to ${attendees.length} attendees for event: ${event.name}`);
  
  // Email sending may fail if credentials aren't set up, so wrap in try/catch
  try {
    // Send email to each attendee
    const emailPromises = attendees.map(async (attendee) => {
      if (!attendee.email) {
        console.log(`No email for attendee: ${attendee.name}, skipping`);
        return;
      }
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: attendee.email,
        subject: `Thank you for attending ${event.name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e63946;">EVENT CONNECT</h2>
            <h3>Thank you for attending ${event.name}!</h3>
            <p>We hope you enjoyed the event and made valuable connections.</p>
            <p>You can view the list of attendees and connect with them using the link below:</p>
            <p><a href="https://linkedin-networker-74zawzz0f-bens-projects-6fbea0fe.vercel.app/attendees/${event._id}" 
                  style="background-color: #e63946; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  View Attendees</a></p>
            <p>Best regards,<br>EVENT CONNECT Team</p>
          </div>
        `
      };
      
      try {
        console.log(`Sending email to ${attendee.email}`);
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${attendee.email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${attendee.email}:`, emailError);
        // We don't want to fail the entire process if one email fails
      }
    });
    
    // Wait for all emails to be sent or fail
    await Promise.all(emailPromises);
    console.log('All emails sent or attempted');
    return { success: true };
  } catch (error) {
    console.error('Error in email sending process:', error);
    return { success: false, error: error.message };
  }
}

// Complete event handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // Handle OPTIONS pre-flight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    console.warn(`Invalid method ${req.method} for /complete-event`);
    return res.status(405).json({ 
      error: 'Method not allowed', 
      message: 'Only POST requests are allowed for this endpoint'
    });
  }

  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      console.warn('Missing eventId in request body');
      return res.status(400).json({ 
        error: 'Missing required field', 
        message: 'eventId is required'
      });
    }

    console.log(`Attempting to complete event: ${eventId}`);
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB');
    const { Attendee, Event } = await connectToDatabase();
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      console.warn(`Event not found: ${eventId}`);
      return res.status(404).json({ 
        error: 'Event not found'
      });
    }
    
    // Check if the event is already completed
    if (event.isCompleted) {
      console.warn(`Event ${eventId} is already marked as completed`);
      return res.status(400).json({ 
        error: 'Event already completed',
        message: 'This event has already been marked as completed'
      });
    }

    // Mark the event as completed
    console.log(`Updating event ${eventId} to completed status`);
    event.isCompleted = true;
    await event.save();
    
    // Find attendees for this event
    console.log(`Fetching attendees for event ${eventId}`);
    const attendees = await Attendee.find({ 
      $or: [
        { eventId: eventId },
        { eventId: event._id.toString() },
        { eventId: event.eventCode }
      ]
    });
    
    console.log(`Found ${attendees.length} attendees for event ${eventId}`);
    
    // Send follow-up emails to attendees
    const emailResult = await sendFollowUpEmails(event, attendees);
    
    // Return success response
    return res.status(200).json({ 
      message: 'Event marked as completed successfully',
      eventId: event._id,
      attendeeCount: attendees.length,
      emailsSent: emailResult.success,
      emailError: emailResult.error || null
    });
    
  } catch (error) {
    console.error('Error completing event:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
