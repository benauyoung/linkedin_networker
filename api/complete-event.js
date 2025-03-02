// API endpoint to mark events as completed and send follow-up emails
import { connectToDatabase } from './_utils/mongodb.js';
import { completeEventAndSendEmails } from './_utils/emailService.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS pre-flight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Connect to the database
    const dbConnection = await connectToDatabase();
    
    // Get event ID from request body
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    // Complete event and send emails
    const result = await completeEventAndSendEmails(eventId, dbConnection);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error completing event:', error);
    return res.status(500).json({ 
      error: 'Failed to complete event', 
      message: error.message || 'Unknown error occurred'
    });
  }
}
