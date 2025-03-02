// API server for EVENT CONNECT (Vercel Serverless)
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectToDatabase } from './_utils/mongodb.js';
import completeEventHandler from './complete-event.js';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://event-registration-app.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Models
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  organizer: { type: String },
  eventCode: { type: String, required: true, unique: true },
  qrCodeUrl: { type: String },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Configure API routes
async function setupApiRoutes(req, res) {
  try {
    // Handle complete-event endpoint
    if (req.url === '/api/complete-event') {
      return await completeEventHandler(req, res);
    }
    
    // Connect to the database
    const dbConnection = await connectToDatabase();
    const { Event } = dbConnection;
    
    // GET events
    if (req.method === 'GET' && req.url === '/api/events') {
      try {
        const events = await Event.find().sort({ createdAt: -1 });
        return res.status(200).json(events);
      } catch (err) {
        console.error('Error listing events:', err);
        return res.status(500).json({ error: 'Error listing events' });
      }
    }
    
    // POST create event
    if (req.method === 'POST' && req.url === '/api/events') {
      try {
        // Parse request body if it's a string
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
        
        // Create new event
        const newEvent = new Event(eventData);
        await newEvent.save();
        
        console.log('Event created successfully:', newEvent._id);
        return res.status(201).json(newEvent);
      } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ 
          error: 'Failed to create event', 
          message: error.message || 'Unknown error occurred'
        });
      }
    }
    
    // Main API route - health check
    if (req.url === '/api' || req.url === '/') {
      return res.status(200).json({
        message: 'EVENT CONNECT API is running',
        status: 'online',
        version: '1.0.0',
        endpoints: [
          '/api/events - Get all events (GET) or create a new event (POST)',
          '/api/events/:id - Get event by ID (coming soon)',
          '/api/complete-event - Mark an event as completed and send follow-up emails (POST)'
        ]
      });
    }
    
    // Handle 404 for unknown routes
    return res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// For local development only (not used in Vercel)
if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 3500;
  app.all('*', async (req, res) => {
    return await setupApiRoutes(req, res);
  });
  
  app.listen(port, () => {
    console.log(`EVENT CONNECT API server running on port ${port}`);
  });
}

// Serverless handler for Vercel
export default async function handler(req, res) {
  // Add CORS headers manually for serverless
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Process API request
  return await setupApiRoutes(req, res);
}
