// API route for single event
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS pre-flight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get the event ID from the request
  const { id } = req.query;
  
  // Mock events data
  const events = {
    'evt101': {
      _id: 'evt101',
      name: 'EVENT CONNECT Tech Summit',
      date: '2023-06-15T00:00:00.000Z',
      location: 'San Francisco, CA',
      description: 'Join us for a day of networking and learning with experts in the tech industry. This summit brings together professionals from various tech fields to share insights, discuss trends, and build valuable connections. The event will feature keynote speakers, panel discussions, and interactive workshops.',
      eventCode: 'EVTCON101',
      registrationUrl: 'https://example.com/evt101'
    },
    'evt102': {
      _id: 'evt102',
      name: 'Digital Marketing Conference',
      date: '2023-07-20T00:00:00.000Z',
      location: 'New York, NY',
      description: 'Connect with marketing professionals and learn the latest strategies in digital marketing. This conference covers topics such as SEO, social media marketing, content strategy, and analytics. Experts from leading companies will share case studies and practical tips for improving your marketing efforts.',
      eventCode: 'EVTCON102',
      registrationUrl: 'https://example.com/evt102'
    },
    'evt103': {
      _id: 'evt103',
      name: 'Startup Networking Mixer',
      date: '2023-08-10T00:00:00.000Z',
      location: 'Austin, TX',
      description: 'Meet founders, investors, and other startup enthusiasts in a casual networking environment. This mixer provides an opportunity to pitch your ideas, find potential collaborators, and get feedback from experienced entrepreneurs. Refreshments will be provided.',
      eventCode: 'EVTCON103',
      registrationUrl: 'https://example.com/evt103'
    },
    // Fallback for demo IDs
    'demo1': {
      _id: 'demo1',
      name: 'Demo Tech Conference',
      date: '2023-04-15T00:00:00.000Z',
      location: 'Virtual Event',
      description: 'This is a demonstration event from the API. The EVENT CONNECT app helps you collect and manage attendee information.',
      eventCode: 'DEMO001',
      registrationUrl: 'https://example.com/demo-event'
    },
    'demo2': {
      _id: 'demo2',
      name: 'Networking Mixer',
      date: '2023-05-20T00:00:00.000Z',
      location: 'San Francisco, CA',
      description: 'Connect with professionals in your industry at our monthly networking mixer.',
      eventCode: 'DEMO002',
      registrationUrl: 'https://example.com/networking-mixer'
    }
  };
  
  // Get the event by ID
  const event = events[id];
  
  if (event) {
    // Return the event data
    res.status(200).json(event);
  } else {
    // Return 404 if event not found
    res.status(404).json({
      error: 'Event not found',
      message: `No event with ID "${id}" exists.`
    });
  }
}
