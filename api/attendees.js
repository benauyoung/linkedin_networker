// API route for attendees
const { connectToMongoDB } = require('./_utils/mongodb');

module.exports = async (req, res) => {
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
  
  try {
    // Connect to the database
    const { Attendee, Event } = await connectToMongoDB();
    
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
        if (!name || !eventId) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            requiredFields: ['name', 'eventId']
          });
        }
        
        // Check if the event exists - try to find by _id first, then by eventCode
        let event = null;
        
        try {
          // Try to find by MongoDB ID
          event = await Event.findById(eventId).catch(() => null);
        } catch (err) {
          console.log('Not a valid MongoDB ID, trying eventCode...');
        }
        
        // If not found by _id, try to find by eventCode
        if (!event) {
          event = await Event.findOne({ eventCode: eventId });
        }
        
        if (!event) {
          return res.status(404).json({ error: 'Event not found', eventId });
        }
        
        console.log('Found event for registration:', event.name, event._id);
        
        // Use the eventCode as the eventId for consistency
        const eventCode = event.eventCode;
        
        // Check if the attendee is already registered for this event
        if (email) {
          const existingAttendee = await Attendee.findOne({ email, eventId: eventCode });
          if (existingAttendee) {
            return res.status(400).json({ error: 'You have already registered for this event' });
          }
        }
        
        // Create new attendee document
        const attendee = new Attendee({
          name,
          email: email || '',
          linkedinUrl: linkedinUrl || '', // Optional field
          eventId: eventCode // Use eventCode for consistency
        });
        
        await attendee.save();
        
        // Return success with event info
        return res.status(201).json({
          success: true,
          attendee,
          event: {
            name: event.name,
            date: event.date,
            location: event.location
          }
        });
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
};
