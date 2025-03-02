// Simple serverless API endpoint for Vercel
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Mock data for demonstration
  const events = [
    {
      _id: 'demo1',
      name: 'Demo Tech Conference',
      date: '2023-04-15T00:00:00.000Z',
      location: 'Virtual Event',
      description: 'This is a demonstration event from the API. The LinkedIn Networker helps you collect and manage attendee information.',
      registrationUrl: 'https://example.com/demo-event'
    },
    {
      _id: 'demo2',
      name: 'Networking Mixer',
      date: '2023-05-20T00:00:00.000Z',
      location: 'San Francisco, CA',
      description: 'Connect with professionals in your industry at our monthly networking mixer.',
      registrationUrl: 'https://example.com/networking-mixer'
    }
  ];
  
  // Return mock events
  res.status(200).json(events);
}
