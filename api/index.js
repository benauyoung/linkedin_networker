// API server for EVENT CONNECT (Vercel Serverless)
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectToMongoDB } = require('./_utils/mongodb');
const completeEventHandler = require('./complete-event');
const logger = require('./_utils/logger');

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
app.use(logger.requestLogger);

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', reason);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  // In a serverless environment, the process might continue
  // In a long-running server, you might want to:
  // process.exit(1);
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
  const requestId = req.requestId || Math.random().toString(36).substring(2, 10).toUpperCase();
  
  try {
    // Handle complete-event endpoint
    if (req.url === '/api/complete-event') {
      logger.debug(`Routing to complete-event handler`, { url: req.url }, requestId);
      return await completeEventHandler(req, res);
    }
    
    // Connect to the database
    logger.debug('Connecting to MongoDB', null, requestId);
    const { Event } = await connectToMongoDB();
    
    // GET events
    if (req.method === 'GET' && req.url === '/api/events') {
      try {
        logger.debug('Fetching all events', null, requestId);
        const events = await Event.find().sort({ createdAt: -1 });
        logger.success(`Successfully fetched ${events.length} events`, requestId);
        return res.status(200).json(events);
      } catch (err) {
        logger.error('Error listing events', err, requestId);
        return res.status(500).json({ 
          error: 'Error listing events',
          message: err.message,
          requestId
        });
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
            logger.error('Error parsing request body', parseError, requestId);
            return res.status(400).json({ 
              error: 'Invalid JSON in request body',
              requestId
            });
          }
        }
        
        if (!eventData || Object.keys(eventData).length === 0) {
          logger.warn('Empty request body received', null, requestId);
          return res.status(400).json({ 
            error: 'Empty or invalid request body',
            requestId
          });
        }
        
        // Validate required fields
        if (!eventData.name || !eventData.date || !eventData.location) {
          const missingFields = [];
          if (!eventData.name) missingFields.push('name');
          if (!eventData.date) missingFields.push('date');
          if (!eventData.location) missingFields.push('location');
          
          logger.warn(`Missing required fields: ${missingFields.join(', ')}`, null, requestId);
          return res.status(400).json({ 
            error: 'Missing required fields',
            requiredFields: ['name', 'date', 'location'],
            missingFields,
            requestId
          });
        }
        
        // Generate eventCode if not provided
        if (!eventData.eventCode) {
          eventData.eventCode = `EVTCON${Math.floor(Math.random() * 900) + 100}`;
          logger.debug(`Generated event code: ${eventData.eventCode}`, null, requestId);
        }
        
        // Create new event
        logger.debug('Creating new event', eventData, requestId);
        const newEvent = new Event(eventData);
        await newEvent.save();
        
        logger.success(`Event created successfully: ${newEvent._id}`, requestId);
        return res.status(201).json(newEvent);
      } catch (error) {
        logger.error('Error creating event', error, requestId);
        return res.status(500).json({ 
          error: 'Failed to create event', 
          message: error.message || 'Unknown error occurred',
          requestId
        });
      }
    }
    
    // GET event by ID
    if (req.method === 'GET' && req.url.match(/^\/api\/events\/[a-zA-Z0-9]+$/)) {
      try {
        const eventId = req.url.split('/').pop();
        logger.debug(`Fetching event by ID: ${eventId}`, null, requestId);
        
        const event = await Event.findById(eventId);
        if (!event) {
          logger.warn(`Event not found: ${eventId}`, null, requestId);
          return res.status(404).json({ 
            error: 'Event not found',
            requestId
          });
        }
        
        logger.success(`Successfully fetched event: ${eventId}`, requestId);
        return res.status(200).json(event);
      } catch (error) {
        logger.error(`Error fetching event by ID`, error, requestId);
        return res.status(500).json({ 
          error: 'Failed to fetch event', 
          message: error.message,
          requestId
        });
      }
    }
    
    // Main API route - health check
    if (req.url === '/api' || req.url === '/') {
      logger.debug('API health check', null, requestId);
      return res.status(200).json({
        message: 'EVENT CONNECT API is running',
        status: 'online',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        requestId,
        endpoints: [
          '/api/events - Get all events (GET) or create a new event (POST)',
          '/api/events/:id - Get event by ID',
          '/api/complete-event - Mark an event as completed and send follow-up emails (POST)'
        ]
      });
    }
    
    // Handle 404 for unknown routes
    logger.warn(`Route not found: ${req.method} ${req.url}`, null, requestId);
    return res.status(404).json({ 
      error: 'Not found', 
      path: req.url, 
      method: req.method,
      requestId
    });
    
  } catch (error) {
    logger.error(`Unhandled API error in ${req.method} ${req.url}`, error, requestId);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
}

// For local development only (not used in Vercel)
if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 3500;
  app.all('*', async (req, res) => {
    return await setupApiRoutes(req, res);
  });
  
  // Add error handler middleware
  app.use(logger.errorHandler);
  
  app.listen(port, () => {
    logger.success(`EVENT CONNECT API server running on port ${port}`);
  });
}

// Serverless handler for Vercel
async function handler(req, res) {
  // Add request ID for tracking
  req.requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Add CORS headers manually for serverless
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Log the request
  logger.info(`[Vercel] ${req.method} ${req.url}`, req.requestId);
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Process API request
    return await setupApiRoutes(req, res);
  } catch (error) {
    logger.error(`[Vercel] Unhandled serverless error: ${req.method} ${req.url}`, error, req.requestId);
    return res.status(500).json({
      error: 'Serverless function error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
      requestId: req.requestId
    });
  }
}

module.exports = handler;
