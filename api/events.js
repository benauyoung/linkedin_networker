// API route for events
import { connectToDatabase } from './_utils/mongodb.js';
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
    // Connect to the database with a timeout
    let dbConnection;
    try {
      dbConnection = await Promise.race([
        connectToDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        )
      ]);
    } catch (connectionError) {
      console.error('Database connection error:', connectionError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: connectionError.message || 'Could not connect to the database'
      });
    }
    
    const { Event } = dbConnection;
    
    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get event ID or code from query parameters if provided
      const { id, code } = req.query;
      
      if (id) {
        // Get specific event by ID
        try {
          const event = await Event.findById(id);
          if (!event) {
            return res.status(404).json({ error: 'Event not found' });
          }
          return res.status(200).json(event);
        } catch (err) {
          console.error('Error finding event by ID:', err);
          return res.status(500).json({ error: 'Error finding event' });
        }
      } else if (code) {
        // Get specific event by code
        try {
          const event = await Event.findOne({ eventCode: code });
          if (!event) {
            return res.status(404).json({ error: 'Event not found' });
          }
          return res.status(200).json(event);
        } catch (err) {
          console.error('Error finding event by code:', err);
          return res.status(500).json({ error: 'Error finding event' });
        }
      } else {
        // Return all events for GET request
        try {
          const events = await Event.find().sort({ createdAt: -1 });
          return res.status(200).json(events);
        } catch (err) {
          console.error('Error listing events:', err);
          return res.status(500).json({ error: 'Error listing events' });
        }
      }
    } else if (req.method === 'POST') {
      try {
        // Parse request body if it's a string (happens in some serverless environments)
        let eventData = req.body;
        if (typeof eventData === 'string') {
          try {
            eventData = JSON.parse(eventData);
          } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return res.status(400).json({ error: 'Invalid JSON in request body' });
          }
        }
        
        if (!eventData || Object.keys(eventData).length === 0) {
          console.error('Empty request body');
          return res.status(400).json({ error: 'Empty or invalid request body' });
        }
        
        // Validate required fields
        if (!eventData.name || !eventData.date || !eventData.location) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            requiredFields: ['name', 'date', 'location'] 
          });
        }
        
        // Generate eventCode if not provided
        if (!eventData.eventCode) {
          eventData.eventCode = `EVTCON${Math.floor(Math.random() * 900) + 100}`;
        }
        
        // Create new event document
        const newEvent = new Event(eventData);
        await newEvent.save();
        
        return res.status(201).json(newEvent);
      } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ 
          error: 'Failed to create event', 
          message: error.message || 'Unknown error occurred'
        });
      }
    } else {
      // Method not allowed
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (dbError) {
    console.error('Database error:', dbError);
    return res.status(500).json({ 
      error: 'Server error', 
      message: dbError.message || 'An unexpected error occurred'
    });
  }
}
