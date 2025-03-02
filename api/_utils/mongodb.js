// MongoDB connection utility for serverless functions
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let cachedDb = null;
let mongoMemoryServer = null;

// Models
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  organizer: { type: String, required: true },
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

export async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using existing MongoDB connection');
    return { db: cachedDb, Event: mongoose.models.Event, Attendee: mongoose.models.Attendee };
  }

  try {
    // Try to connect to MongoDB Atlas first
    if (process.env.MONGODB_URI) {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      cachedDb = mongoose.connection.db;
      console.log('Connected to MongoDB Atlas');
      
      // Create models if they don't exist
      const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
      const Attendee = mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema);
      
      return { db: cachedDb, Event, Attendee };
    } else {
      // If no MongoDB URI, use in-memory MongoDB
      console.log('No MongoDB URI found, using in-memory MongoDB...');
      
      // Create in-memory MongoDB server
      mongoMemoryServer = await MongoMemoryServer.create();
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
      
      return { db: cachedDb, Event, Attendee };
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
  cachedDb = null;
}
