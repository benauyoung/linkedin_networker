const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  organizer: {
    type: String,
    required: true,
    trim: true
  },
  qrCodeUrl: {
    type: String,
    required: true
  },
  eventCode: {
    type: String,
    required: true,
    unique: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  emailsSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);
