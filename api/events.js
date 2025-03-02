// API route for events
import { connectToDatabase } from './_utils/mongodb';
import { v4 as uuidv4 } from 'uuid';

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
    const { Event } = await connectToDatabase();
    
    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get event ID or code from query parameters if provided
      const { id, code } = req.query;
      
      if (id) {
        // Get specific event by ID
        const event = await Event.findById(id);
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }
        return res.status(200).json(event);
      } else if (code) {
        // Get specific event by code
        const event = await Event.findOne({ eventCode: code });
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }
        return res.status(200).json(event);
      } else {
        // Return all events for GET request
        const events = await Event.find().sort({ createdAt: -1 });
        return res.status(200).json(events);
      }
    } else if (req.method === 'POST') {
      try {
        // Handle event creation
        const eventData = req.body;
        
        // Generate eventCode if not provided
        if (!eventData.eventCode) {
          eventData.eventCode = `EVTCON${Math.floor(Math.random() * 900) + 100}`;
        }
        
        // Generate ID if not provided
        if (!eventData._id) {
          eventData._id = `evt${Date.now()}`;
        }
        
        // Create new event document
        const newEvent = new Event(eventData);
        await newEvent.save();
        
        return res.status(201).json(newEvent);
      } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ error: 'Failed to create event: ' + error.message });
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
