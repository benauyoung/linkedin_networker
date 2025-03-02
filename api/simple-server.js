// Simple Express server for testing event creation
import express from 'express';
import cors from 'cors';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Create Express app
const app = express();
const port = 3500; // Using a different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Models
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  organizer: { type: String },
  eventCode: { type: String, required: true, unique: true },
  qrCodeUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Prevent mongoose warning about the strictQuery option
mongoose.set('strictQuery', false);

let mongoMemoryServer = null;

// Start in-memory MongoDB and connect
async function setupDatabase() {
  try {
    // Create in-memory MongoDB server
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to in-memory MongoDB');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}

// Set up API routes
async function setupRoutes() {
  // Create Event model
  const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
  
  // GET all events
  app.get('/api/events', async (req, res) => {
    try {
      const events = await Event.find().sort({ createdAt: -1 });
      res.status(200).json(events);
    } catch (err) {
      console.error('Error listing events:', err);
      res.status(500).json({ error: 'Error listing events' });
    }
  });
  
  // POST create event
  app.post('/api/events', async (req, res) => {
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
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ 
        error: 'Failed to create event', 
        message: error.message || 'Unknown error occurred'
      });
    }
  });
  
  // Main API route
  app.get('/api', (req, res) => {
    res.status(200).json({
      message: 'EVENT CONNECT API is running',
      status: 'online',
      version: '1.0.0'
    });
  });
}

// Start the server
async function startServer() {
  const dbReady = await setupDatabase();
  
  if (dbReady) {
    await setupRoutes();
    
    app.listen(port, () => {
      console.log(`EVENT CONNECT API server running on port ${port}`);
      console.log(`Test API at: http://localhost:${port}/api`);
      console.log(`Create events at: http://localhost:${port}/api/events`);
    });
  } else {
    console.error('Could not start server - database setup failed');
  }
}

startServer().catch(err => console.error('Server startup error:', err));
