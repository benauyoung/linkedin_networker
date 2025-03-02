// Simple handler for Vercel serverless function
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Mock data for a basic API response
  const apiResponse = {
    message: 'EVENT CONNECT API is running',
    status: 'online',
    version: '1.0.0',
    endpoints: [
      '/api/events - Get all events',
      '/api/events/:id - Get event by ID',
      '/api/attendees/event/:id - Get attendees for an event'
    ]
  };
  
  // Return a success response
  res.status(200).json(apiResponse);
}
