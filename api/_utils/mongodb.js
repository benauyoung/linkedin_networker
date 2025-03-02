// MongoDB connection utility for serverless functions
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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
  eventCode: { type: String, required: true, unique: true },
  qrCodeUrl: { type: String },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const AttendeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  eventId: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now }
});

// Prevent mongoose warning about the strictQuery option
mongoose.set('strictQuery', false);

// Timeout promise helper
const timeoutPromise = (ms) => 
  new Promise((_, reject) => setTimeout(() => reject(new Error(`Connection timed out after ${ms}ms`)), ms));

export async function connectToDatabase() {
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
      await connectionPromise;
      return { 
        db: cachedDb, 
        Event: mongoose.models.Event || mongoose.model('Event', EventSchema),
        Attendee: mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema)
      };
    } catch (error) {
      console.error('Error waiting for existing connection:', error);
      // Continue to try a new connection
    }
  }
  
  // Set up a new connection
  isConnecting = true;
  connectionPromise = (async () => {
    try {
      // Reset connection if it's in a bad state
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      
      // First try to connect to MongoDB Atlas if URI is provided
      if (process.env.MONGODB_URI) {
        console.log('Connecting to MongoDB Atlas...');
        
        try {
          // Use a timeout to avoid hanging on serverless functions
          await Promise.race([
            mongoose.connect(process.env.MONGODB_URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
              socketTimeoutMS: 30000, // 30 second timeout for socket operations
            }),
            timeoutPromise(10000) // 10 second overall timeout
          ]);
          
          cachedDb = mongoose.connection.db;
          console.log('Connected to MongoDB Atlas');
          
          // Create models if they don't exist
          const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
          const Attendee = mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema);
          
          isConnecting = false;
          return { db: cachedDb, Event, Attendee };
        } catch (atlasError) {
          console.error('Error connecting to MongoDB Atlas:', atlasError);
          console.log('Falling back to in-memory MongoDB...');
          // Fall through to in-memory option
        }
      } else {
        console.log('No MongoDB URI found, using in-memory MongoDB...');
      }
      
      // Fallback to in-memory MongoDB
      try {
        // Create in-memory MongoDB server if it doesn't exist
        if (!mongoMemoryServer) {
          mongoMemoryServer = await MongoMemoryServer.create();
        }
        
        const uri = mongoMemoryServer.getUri();
        
        await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        
        cachedDb = mongoose.connection.db;
        console.log('Connected to in-memory MongoDB');
        
        // Create models if they don't exist
        const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
        const Attendee = mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema);
        
        isConnecting = false;
        return { db: cachedDb, Event, Attendee };
      } catch (memoryError) {
        console.error('Error connecting to in-memory MongoDB:', memoryError);
        throw memoryError;
      }
    } catch (error) {
      isConnecting = false;
      console.error('MongoDB connection error:', error);
      throw error;
    }
  })();
  
  return connectionPromise;
}

export async function disconnectFromDatabase() {
  try {
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    cachedDb = null;
    isConnecting = false;
    connectionPromise = null;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}
