/**
 * Handler for the complete-event endpoint
 * Marks an event as completed and sends follow-up emails to attendees
 */
import { connectToDatabase } from './_utils/mongodb.js';

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
    const attendees = await Attendee.find({ eventId });
    
    console.log(`Found ${attendees.length} attendees for event ${eventId}`);
    
    // Return success response
    return res.status(200).json({ 
      message: 'Event marked as completed successfully',
      eventId: event._id,
      attendeeCount: attendees.length
    });
    
  } catch (error) {
    console.error('Error completing event:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
