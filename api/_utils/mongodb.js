// MongoDB connection utility for serverless functions
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Global variables for caching connection
let cachedDb = null;
let mongoMemoryServer = null;
let connectionPromise = null;
let isConnecting = false;

// Models
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  organizer: { type: String },
  eventCode: { 
    type: String, 
    default: () => 'EVT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    unique: true 
  },
  qrCodeUrl: { type: String },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const AttendeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  linkedinUrl: { type: String },
  eventId: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: Date
});

// Prevent mongoose warning about the strictQuery option
mongoose.set('strictQuery', false);

// Timeout promise helper
const timeoutPromise = (ms) => 
  new Promise((_, reject) => setTimeout(() => reject(new Error(`Connection timed out after ${ms}ms`)), ms));

async function connectToMongoDB() {
  // If we already have a connection, return it
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return { 
      db: cachedDb, 
      Event: mongoose.models.Event || mongoose.model('Event', EventSchema),
      Attendee: mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema)
    };
  }
  
  // If we're in the process of connecting, wait for that to finish
  if (isConnecting && connectionPromise) {
    try {
      console.log('Waiting for existing MongoDB connection attempt to complete');
      await connectionPromise;
      return { 
        db: cachedDb, 
        Event: mongoose.models.Event || mongoose.model('Event', EventSchema),
        Attendee: mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema)
      };
    } catch (error) {
      console.error('Existing connection attempt failed, retrying:', error);
      // The existing attempt failed, so we'll try a new one
    }
  }
  
  isConnecting = true;
  connectionPromise = (async () => {
    try {
      // Set a connection timeout of 15 seconds
      const TIMEOUT_MS = 15000;
      
      // Try connecting to MongoDB Atlas if URI is provided
      if (process.env.MONGODB_URI) {
        try {
          console.log('Connecting to MongoDB Atlas...');
          
          await Promise.race([
            mongoose.connect(process.env.MONGODB_URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true
            }),
            timeoutPromise(TIMEOUT_MS)
          ]);
          
          console.log('Successfully connected to MongoDB Atlas');
          cachedDb = mongoose.connection.db;
          return cachedDb;
        } catch (atlasError) {
          console.error('Failed to connect to MongoDB Atlas:', atlasError);
          console.log('Falling back to in-memory MongoDB...');
          // Fall through to in-memory MongoDB
        }
      }
      
      // Fall back to in-memory MongoDB for development
      console.log('Initializing in-memory MongoDB...');
      
      // Ensure the previous server is closed if it exists
      if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
      }
      
      // Create a new in-memory server
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      
      await Promise.race([
        mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }),
        timeoutPromise(TIMEOUT_MS)
      ]);
      
      console.log('Connected to in-memory MongoDB');
      cachedDb = mongoose.connection.db;
      return cachedDb;
    } catch (error) {
      console.error('Failed to connect to any MongoDB instance:', error);
      throw error;
    } finally {
      isConnecting = false;
    }
  })();
  
  try {
    await connectionPromise;
    return { 
      db: cachedDb, 
      Event: mongoose.models.Event || mongoose.model('Event', EventSchema),
      Attendee: mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema)
    };
  } catch (error) {
    console.error('Connection to MongoDB failed:', error);
    throw error;
  }
}

async function disconnectFromMongoDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
    
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
      console.log('Stopped in-memory MongoDB server');
    }
    
    cachedDb = null;
    connectionPromise = null;
    isConnecting = false;
  } catch (error) {
    console.error('Error during MongoDB disconnection:', error);
  }
}

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB,
  EventSchema,
  AttendeeSchema
};
