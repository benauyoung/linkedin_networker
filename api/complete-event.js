/**
 * Handler for the complete-event endpoint
 * Marks an event as completed and sends follow-up emails to attendees
 */
const mongoose = require('mongoose');
const { connectToMongoDB } = require('./_utils/mongodb');
const EmailService = require('./_utils/emailService');
const logger = require('./_utils/logger');

// Complete event handler
async function completeEventHandler(req, res) {
  // Get request ID for tracking or generate a new one
  const requestId = req.requestId || Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    logger.warn(`Invalid method ${req.method} for /api/complete-event`, null, requestId);
    return res.status(405).json({ 
      error: 'Method not allowed', 
      message: 'Only POST requests are allowed for this endpoint',
      requestId
    });
  }

  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      logger.warn('Missing eventId in request body', null, requestId);
      return res.status(400).json({ 
        error: 'Missing required field', 
        message: 'eventId is required',
        requestId
      });
    }

    logger.info(`Attempting to complete event: ${eventId}`, requestId);
    
    // Connect to MongoDB
    logger.debug('Connecting to MongoDB', null, requestId);
    const { Event, Attendee } = await connectToMongoDB();
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      logger.warn(`Event not found: ${eventId}`, null, requestId);
      return res.status(404).json({ 
        error: 'Event not found',
        requestId 
      });
    }
    
    // Check if the event is already completed
    if (event.isCompleted) {
      logger.warn(`Event ${eventId} is already marked as completed`, null, requestId);
      return res.status(400).json({ 
        error: 'Event already completed',
        message: 'This event has already been marked as completed',
        requestId
      });
    }

    // Mark the event as completed
    logger.debug(`Updating event ${eventId} to completed status`, null, requestId);
    event.isCompleted = true;
    await event.save();
    
    // Find attendees for this event
    logger.debug(`Fetching attendees for event ${eventId}`, null, requestId);
    const attendees = await Attendee.find({ eventId: event.eventCode });
    
    if (attendees.length === 0) {
      logger.warn(`No attendees found for event ${eventId}`, null, requestId);
      return res.status(200).json({ 
        message: 'Event marked as completed, but no attendees were found to send emails to',
        eventId: event._id,
        requestId
      });
    }

    // Initialize email service
    logger.debug('Initializing email service', null, requestId);
    const emailService = new EmailService();
    await emailService.initialize();
    
    // Send follow-up emails to all attendees
    logger.info(`Sending follow-up emails to ${attendees.length} attendees`, requestId);
    
    const emailResults = {
      success: 0,
      failures: 0,
      errors: []
    };
    
    // Process emails in batches to avoid overwhelming the server
    const batchSize = 10;
    
    for (let i = 0; i < attendees.length; i += batchSize) {
      const batch = attendees.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (attendee) => {
        try {
          logger.debug(`Sending email to ${attendee.email}`, null, requestId);
          await emailService.sendFollowUpEmail(attendee, event);
          emailResults.success++;
          return { success: true, email: attendee.email };
        } catch (error) {
          logger.error(`Failed to send email to ${attendee.email}`, error, requestId);
          emailResults.failures++;
          emailResults.errors.push({
            email: attendee.email,
            error: error.message
          });
          return { success: false, email: attendee.email, error: error.message };
        }
      });
      
      await Promise.all(emailPromises);
    }
    
    // Log success or partial success
    if (emailResults.failures === 0) {
      logger.success(`Successfully sent all ${emailResults.success} follow-up emails for event ${eventId}`, requestId);
    } else {
      logger.warn(
        `Sent ${emailResults.success} emails with ${emailResults.failures} failures for event ${eventId}`,
        { errors: emailResults.errors }, 
        requestId
      );
    }
    
    // Return success response with email results
    return res.status(200).json({
      message: 'Event marked as completed and follow-up emails sent',
      eventId: event._id,
      emailResults: {
        total: attendees.length,
        sent: emailResults.success,
        failed: emailResults.failures,
        errors: emailResults.errors.length > 0 ? emailResults.errors : undefined
      },
      requestId
    });
    
  } catch (error) {
    logger.error('Error completing event', error, requestId);
    return res.status(500).json({
      error: 'Failed to complete event',
      message: error.message,
      requestId
    });
  }
}

module.exports = completeEventHandler;
