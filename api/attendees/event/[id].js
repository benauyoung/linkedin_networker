// API route for attendees by event ID
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
  
  // Mock attendees data for different events
  const eventAttendees = {
    'evt101': [
      { _id: 'att1001', name: 'John Smith', email: 'john.smith@example.com', linkedInUrl: 'https://linkedin.com/in/johnsmith', registerDate: '2023-05-10T14:30:00.000Z' },
      { _id: 'att1002', name: 'Emily Johnson', email: 'emily.j@example.com', linkedInUrl: 'https://linkedin.com/in/emilyjohnson', registerDate: '2023-05-11T09:15:00.000Z' },
      { _id: 'att1003', name: 'Michael Davis', email: 'mdavis@example.com', linkedInUrl: 'https://linkedin.com/in/michaeldavis', registerDate: '2023-05-12T16:45:00.000Z' }
    ],
    'evt102': [
      { _id: 'att2001', name: 'Sarah Wilson', email: 'swilson@example.com', linkedInUrl: 'https://linkedin.com/in/sarahwilson', registerDate: '2023-06-05T10:30:00.000Z' },
      { _id: 'att2002', name: 'David Thompson', email: 'david.t@example.com', linkedInUrl: 'https://linkedin.com/in/davidthompson', registerDate: '2023-06-06T11:20:00.000Z' }
    ],
    'evt103': [
      { _id: 'att3001', name: 'Jessica Brown', email: 'jessica.b@example.com', linkedInUrl: 'https://linkedin.com/in/jessicabrown', registerDate: '2023-07-01T13:45:00.000Z' },
      { _id: 'att3002', name: 'Robert Miller', email: 'robertm@example.com', linkedInUrl: 'https://linkedin.com/in/robertmiller', registerDate: '2023-07-02T09:30:00.000Z' },
      { _id: 'att3003', name: 'Jennifer Davis', email: 'jdavis@example.com', linkedInUrl: 'https://linkedin.com/in/jenniferdavis', registerDate: '2023-07-03T14:15:00.000Z' },
      { _id: 'att3004', name: 'William Taylor', email: 'wtaylor@example.com', linkedInUrl: 'https://linkedin.com/in/williamtaylor', registerDate: '2023-07-04T15:30:00.000Z' }
    ],
    'demo1': [
      { _id: 'att4001', name: 'Alex Johnson', email: 'alex.j@example.com', linkedInUrl: 'https://linkedin.com/in/alexjohnson', registerDate: '2023-03-10T11:30:00.000Z' },
      { _id: 'att4002', name: 'Samantha Lee', email: 'slee@example.com', linkedInUrl: 'https://linkedin.com/in/samanthalee', registerDate: '2023-03-11T10:15:00.000Z' }
    ],
    'demo2': [
      { _id: 'att5001', name: 'James Wilson', email: 'jwilson@example.com', linkedInUrl: 'https://linkedin.com/in/jameswilson', registerDate: '2023-04-05T16:20:00.000Z' },
      { _id: 'att5002', name: 'Olivia Martin', email: 'olivia.m@example.com', linkedInUrl: 'https://linkedin.com/in/oliviamartin', registerDate: '2023-04-06T09:45:00.000Z' },
      { _id: 'att5003', name: 'Daniel Garcia', email: 'dgarcia@example.com', linkedInUrl: 'https://linkedin.com/in/danielgarcia', registerDate: '2023-04-07T14:30:00.000Z' }
    ]
  };
  
  // Get attendees for the event ID
  const attendees = eventAttendees[id] || [];
  
  // Return the attendees data
  res.status(200).json(attendees);
}
