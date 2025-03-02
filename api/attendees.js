// API route for attendees
import { connectToDatabase } from './_utils/mongodb';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS pre-flight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Connect to the database
    const { Attendee, Event } = await connectToDatabase();
    
    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get event ID from query parameter
      const { eventId } = req.query;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }
      
      // Return attendees for the specific event
      const attendees = await Attendee.find({ eventId }).sort({ registeredAt: -1 });
      return res.status(200).json(attendees);
    } else if (req.method === 'POST') {
      try {
        const { name, email, linkedinUrl, eventId } = req.body;
        
        // Validate required fields
        if (!name || !email || !linkedinUrl || !eventId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        // Check if the attendee is already registered for this event
        const existingAttendee = await Attendee.findOne({ email, eventId });
        if (existingAttendee) {
          return res.status(400).json({ error: 'You have already registered for this event' });
        }
        
        // Create new attendee document
        const attendee = new Attendee({
          name,
          email,
          linkedinUrl,
          eventId
        });
        
        await attendee.save();
        return res.status(201).json(attendee);
      } catch (error) {
        console.error('Error registering attendee:', error);
        return res.status(500).json({ error: 'Failed to register: ' + error.message });
      }
    } else {
      // Method not allowed
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (dbError) {
    console.error('Database error:', dbError);
    return res.status(500).json({ error: 'Database connection failed', details: dbError.message });
  }
}
