// Simple Express server for development
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToMongoDB } = require('./_utils/mongodb');
const completeEventHandler = require('./complete-event');
const attendeesHandler = require('./attendees');

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3500', 'https://event-registration-app.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    message: 'Welcome to EVENT CONNECT API',
    endpoints: [
      '/api/events',
      '/api/events/:id',
      '/api/attendees',
      '/api/attendees/:eventId',
      '/api/complete-event'
    ]
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    service: 'EVENT CONNECT API',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Event routes
app.get('/api/events', async (req, res) => {
  try {
    const { Event } = await connectToMongoDB();
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events', details: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { Event } = await connectToMongoDB();
    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.name || !eventData.location) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        requiredFields: ['name', 'location'] 
      });
    }
    
    // Set default date if not provided
    if (!eventData.date) {
      eventData.date = new Date();
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
      details: error.message 
    });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const { Event } = await connectToMongoDB();
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    return res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Complete event endpoint
app.post('/api/complete-event', async (req, res) => {
  return await completeEventHandler(req, res);
});

// Attendees endpoints
app.get('/api/attendees', async (req, res) => {
  return await attendeesHandler(req, res);
});

app.post('/api/attendees', async (req, res) => {
  return await attendeesHandler(req, res);
});

app.get('/api/attendees/:eventId', async (req, res) => {
  req.query = { eventId: req.params.eventId };
  return await attendeesHandler(req, res);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export for testing
module.exports = { app };
