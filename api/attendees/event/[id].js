// Simple serverless API endpoint for Vercel to get attendees for an event
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get the event ID from the query
  const { id } = req.query;
  
  // Mock attendees data
  const attendeesByEvent = {
    'demo1': [
      {
        _id: 'attendee1',
        name: 'John Doe',
        email: 'john@example.com',
        linkedinProfile: 'https://linkedin.com/in/johndoe',
        eventId: 'demo1',
        registrationDate: '2023-03-10T00:00:00.000Z'
      },
      {
        _id: 'attendee2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        linkedinProfile: 'https://linkedin.com/in/janesmith',
        eventId: 'demo1',
        registrationDate: '2023-03-12T00:00:00.000Z'
      }
    ],
    'demo2': [
      {
        _id: 'attendee3',
        name: 'Michael Johnson',
        email: 'michael@example.com',
        linkedinProfile: 'https://linkedin.com/in/michaeljohnson',
        eventId: 'demo2',
        registrationDate: '2023-04-05T00:00:00.000Z'
      }
    ]
  };
  
  // Find attendees for the event
  const attendees = attendeesByEvent[id] || [];
  
  // Return the attendees
  res.status(200).json(attendees);
}
