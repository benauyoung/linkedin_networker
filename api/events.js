// API route for events
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS pre-flight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Mock events data
  const events = [
    {
      _id: 'evt101',
      name: 'EVENT CONNECT Tech Summit',
      date: '2023-06-15T00:00:00.000Z',
      location: 'San Francisco, CA',
      description: 'Join us for a day of networking and learning with experts in the tech industry.',
      eventCode: 'EVTCON101'
    },
    {
      _id: 'evt102',
      name: 'Digital Marketing Conference',
      date: '2023-07-20T00:00:00.000Z',
      location: 'New York, NY',
      description: 'Connect with marketing professionals and learn the latest strategies in digital marketing.',
      eventCode: 'EVTCON102'
    },
    {
      _id: 'evt103',
      name: 'Startup Networking Mixer',
      date: '2023-08-10T00:00:00.000Z',
      location: 'Austin, TX',
      description: 'Meet founders, investors, and other startup enthusiasts in a casual networking environment.',
      eventCode: 'EVTCON103'
    }
  ];
  
  // Return the events data
  res.status(200).json(events);
}
