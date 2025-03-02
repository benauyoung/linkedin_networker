// API endpoint to mark events as completed and send follow-up emails
const { connectToMongoDB } = require('./_utils/mongodb');
const emailService = require('./_utils/emailService');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    // Extract eventId from request body
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Connect to MongoDB
    const db = await connectToMongoDB();
    const { Event, Attendee } = db;

    // Find the event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Update the event as completed
    event.isCompleted = true;
    await event.save();

    // Find all attendees for this event
    let attendees = [];
    try {
      attendees = await Attendee.find({ eventId: event.eventCode });
      console.log(`Found ${attendees.length} attendees for event ${event.name}`);
    } catch (error) {
      console.warn(`Error fetching attendees: ${error.message}`);
      // We'll continue even without attendees and use test data in development
    }

    // Send follow-up emails
    const emailResult = await emailService.sendEventFollowUpEmails(event, attendees);

    // Return success response with email results
    return res.status(200).json({
      success: true,
      message: `Event "${event.name}" marked as completed.`,
      emailStats: emailResult,
      eventId: event._id
    });
  } catch (error) {
    console.error('Error completing event:', error);
    return res.status(500).json({ 
      error: 'Failed to complete event', 
      details: error.message 
    });
  }
}
