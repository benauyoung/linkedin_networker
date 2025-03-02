// Simple Express server for local development
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { v4 as uuidv4 } from 'uuid';
import { initializeEmailTransporter, sendEventEmails } from './_utils/emailService.js';

// In-memory MongoDB server
let mongod = null;
let dbConnection = null;

// Define Event model schema
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

// Define Attendee model schema for email functionality
const AttendeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  eventId: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  checkedIn: { type: Boolean, default: false },
  checkinDate: { type: Date }
});

// Connect to in-memory MongoDB
async function connectToMongoDB() {
  if (dbConnection) {
    return { Event: dbConnection.model('Event', EventSchema) };
  }
  
  try {
    console.log('Starting in-memory MongoDB server...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('MongoDB URI:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to in-memory MongoDB');
    
    const Event = mongoose.model('Event', EventSchema);
    const Attendee = mongoose.model('Attendee', AttendeeSchema);
    
    dbConnection = mongoose.connection;
    return { Event, Attendee };
  } catch (error) {
    console.error('Failed to connect to in-memory MongoDB:', error);
    throw error;
  }
}

// Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/events', async (req, res) => {
  try {
    const { Event } = await connectToMongoDB();
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: 'Error listing events' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { Event } = await connectToMongoDB();
    
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

// New endpoint for completing events and sending emails
app.post('/api/complete-event', async (req, res) => {
  try {
    const { Event, Attendee } = await connectToMongoDB();
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found` });
    }
    
    // Mark event as completed
    event.isCompleted = true;
    await event.save();
    
    // For testing purposes, let's create some test attendees if none exist
    let attendees = await Attendee.find({ eventId: event.eventCode });
    
    if (attendees.length === 0) {
      // Generate some test attendees for demonstration
      const testAttendees = [
        {
          name: 'Test Attendee 1',
          email: 'test1@example.com',
          phone: '123-456-7890',
          eventId: event.eventCode
        },
        {
          name: 'Test Attendee 2',
          email: 'test2@example.com',
          phone: '234-567-8901',
          eventId: event.eventCode
        }
      ];
      
      attendees = await Attendee.insertMany(testAttendees);
      console.log('Created test attendees for demonstration');
    }
    
    // Initialize email transporter
    await initializeEmailTransporter();
    
    // Send emails
    const emailResult = await sendEventEmails(event, attendees, 'followup');
    
    return res.status(200).json({
      success: true,
      event: event,
      emailsSent: emailResult.count,
      message: `Event marked as completed and ${emailResult.count} follow-up emails sent`,
      note: 'For test accounts, check the console for email preview URLs'
    });
  } catch (error) {
    console.error('Error completing event:', error);
    return res.status(500).json({ 
      error: 'Failed to complete event', 
      message: error.message || 'Unknown error occurred'
    });
  }
});

// API status endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'EVENT CONNECT API is running',
    status: 'online',
    version: '1.0.0',
    endpoints: [
      '/api/events - Get all events (GET) or create a new event (POST)',
      '/api/events/:id - Get event by ID (coming soon)',
      '/api/complete-event - Mark an event as completed and send follow-up emails (POST)'
    ]
  });
});

// Start server
async function startServer() {
  const port = process.env.PORT || 3500;
  app.listen(port, () => {
    console.log(`\n🔵 EVENT CONNECT API server running on http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('  - GET  /api        - API status');
    console.log('  - GET  /api/events - List all events');
    console.log('  - POST /api/events - Create a new event');
    console.log('  - POST /api/complete-event - Complete an event and send follow-up emails\n');
  });
}

// Initialize and start server
try {
  await connectToMongoDB();
  await startServer();
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
