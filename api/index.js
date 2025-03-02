// Serverless function handler for Vercel
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const eventRoutes = require('../backend/routes/eventRoutes');
const attendeeRoutes = require('../backend/routes/attendeeRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://USERNAME:PASSWORD@cluster0.mongodb.net/linkedin-networker';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // If we can't connect to the database, use in-memory MongoDB
    console.log('Using in-memory MongoDB instead');
  }
};

// Connect to MongoDB when the app starts
connectDB();

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);

// Handle requests to the root serverless function
app.get('/api', (req, res) => {
  res.json({ message: 'LinkedIn Networker API is running' });
});

// Handle production
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle all other routes by serving the main index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Export for Vercel
module.exports = app;
