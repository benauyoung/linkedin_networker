// API routing for EVENT CONNECT (Vercel Serverless Functions)
import events from './events.js';
import attendees from './attendees.js';

export default async function handler(req, res) {
  // Extract the API path from the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const path = pathname.split('/').filter(Boolean)[0] || '';
  
  console.log(`[API Router] Handling ${req.method} request for path: ${path} (Full URL: ${pathname})`);
  
  // Route to the appropriate API handler
  switch (path) {
    case 'events':
      return events(req, res);
    case 'attendees':
      return attendees(req, res);
    default:
      // 404 handler
      return res.status(404).json({ 
        error: 'API endpoint not found',
        path,
        pathname,
        availableEndpoints: [
          '/api/events',
          '/api/attendees'
        ]
      });
  }
}
