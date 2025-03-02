const express = require('express');
const router = express.Router();
const Attendee = require('../models/Attendee');
const Event = require('../models/Event');

// Register a new attendee
router.post('/', async (req, res) => {
  try {
    const { name, email, linkedinUrl, eventId } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if attendee already registered for this event
    const existingAttendee = await Attendee.findOne({ email, eventId });
    if (existingAttendee) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }
    
    // Create new attendee
    const attendee = new Attendee({
      name,
      email,
      linkedinUrl,
      eventId
    });
    
    await attendee.save();
    res.status(201).json(attendee);
  } catch (error) {
    console.error('Error registering attendee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attendees
router.get('/', async (req, res) => {
  try {
    const attendees = await Attendee.find().sort({ registeredAt: -1 });
    res.json(attendees);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific attendee
router.get('/:id', async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    res.json(attendee);
  } catch (error) {
    console.error('Error fetching attendee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an attendee
router.put('/:id', async (req, res) => {
  try {
    const { name, email, linkedinUrl } = req.body;
    const attendee = await Attendee.findByIdAndUpdate(
      req.params.id,
      { name, email, linkedinUrl },
      { new: true }
    );
    
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    
    res.json(attendee);
  } catch (error) {
    console.error('Error updating attendee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an attendee
router.delete('/:id', async (req, res) => {
  try {
    const attendee = await Attendee.findByIdAndDelete(req.params.id);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    res.json({ message: 'Attendee deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
