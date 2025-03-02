const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { name, date, location, description, organizer } = req.body;
    
    // Generate a unique code for the event
    const eventCode = uuidv4().substring(0, 8);
    
    // Create event in database
    const event = new Event({
      name,
      date,
      location,
      description,
      organizer,
      eventCode,
      qrCodeUrl: 'placeholder' // Will be updated with QR code
    });
    
    // Generate QR code that points to the registration page
    const registrationUrl = `${process.env.FRONTEND_URL}/register/${eventCode}`;
    const qrCodeDataUrl = await qrcode.toDataURL(registrationUrl);
    
    // Update event with QR code URL
    event.qrCodeUrl = qrCodeDataUrl;
    
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific event by its code
router.get('/code/:eventCode', async (req, res) => {
  try {
    const event = await Event.findOne({ eventCode: req.params.eventCode });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event by code:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const { name, date, location, description, organizer, isCompleted } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, date, location, description, organizer, isCompleted },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // If event is marked as completed and emails haven't been sent yet, send emails to all attendees
    if (isCompleted && !event.emailsSent) {
      const attendees = await Attendee.find({ eventId: event._id });
      
      // Skip email sending if no attendees
      if (attendees.length === 0) {
        event.emailsSent = true;
        await event.save();
        return res.json(event);
      }
      
      // Setup nodemailer
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      // Attendee list URL
      const attendeeListUrl = `${process.env.FRONTEND_URL}/attendees/${event._id}`;
      
      // Send email to each attendee
      for (const attendee of attendees) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: attendee.email,
          subject: `Thank you for attending ${event.name}!`,
          html: `
            <h1>Thank you for attending ${event.name}!</h1>
            <p>We hope you enjoyed the event. You can now connect with other attendees who joined the event.</p>
            <p><a href="${attendeeListUrl}">Click here to view all attendees</a></p>
            <p>Best regards,<br>The Event Team</p>
          `
        };
        
        await transporter.sendMail(mailOptions);
      }
      
      // Mark emails as sent
      event.emailsSent = true;
      await event.save();
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete all attendees associated with this event
    await Attendee.deleteMany({ eventId: req.params.id });
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attendees for a specific event
router.get('/:id/attendees', async (req, res) => {
  try {
    const attendees = await Attendee.find({ eventId: req.params.id });
    res.json(attendees);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
