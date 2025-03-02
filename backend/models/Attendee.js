const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  linkedinUrl: {
    type: String,
    required: true,
    trim: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure an attendee can only register once per event
attendeeSchema.index({ email: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Attendee', attendeeSchema);
