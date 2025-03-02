require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const eventRoutes = require('./routes/eventRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-registration', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Attempting to use in-memory MongoDB...');
    
    try {
      // If MongoDB Atlas connection fails, try to use in-memory MongoDB
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to in-memory MongoDB');
    } catch (memErr) {
      console.error('Failed to connect to in-memory MongoDB:', memErr);
      process.exit(1);
    }
  }
};

connectDB();

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const buildPath = path.resolve(__dirname, '../frontend/build');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For Vercel serverless functions
module.exports = app;
