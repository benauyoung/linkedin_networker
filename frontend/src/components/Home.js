import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import axios from '../axiosConfig';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Try to fetch from the API
        console.log('Fetching events from API...');
        const response = await axios.get('/events');
        console.log('Events data:', response.data);
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        
        // Set mock data for demonstration when API is unavailable
        setEvents([
          {
            _id: 'demo1',
            name: 'Demo Tech Conference',
            date: '2023-04-15T00:00:00.000Z',
            location: 'Virtual Event',
            description: 'This is a demonstration event while the API is being configured.'
          },
          {
            _id: 'demo2',
            name: 'Networking Mixer',
            date: '2023-05-20T00:00:00.000Z',
            location: 'San Francisco, CA',
            description: 'Connect with professionals in your industry at our monthly networking mixer.'
          }
        ]);
        
        setError('Unable to connect to the server. Showing demo content instead.');
        setLoading(false);
      }
    };

    // Add a small delay to ensure components are mounted
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="danger">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <div className="welcome-header text-center mb-4">
        <h1 className="text-danger">Welcome to EVENT CONNECT</h1>
        <p className="lead">Create and manage professional networking events, collect LinkedIn profiles from attendees</p>
      </div>

      <Card className="text-center mb-5 shadow-sm">
        <Card.Body className="py-5">
          <img 
            src="/assets/walking-logo.svg" 
            alt="EVENT CONNECT Logo" 
            style={{ width: '60px', marginBottom: '15px', color: '#dc3545' }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNkYzM1NDUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTMgMnY4aDUiPjwvcGF0aD48cGF0aCBkPSJNMTMgMTB2NmgzYTIgMiAwIDAgMCAwLTQgMiAyIDAgMCAwIDAtNGgtM3oiPjwvcGF0aD48cGF0aCBkPSJNMTMgMjJoLTJ2LTJoMnYtMmgtMnYtMmgydi0yIj48L3BhdGg+PC9zdmc+';
            }}
          />
          <Card.Title className="fs-3 mb-3">Ready to start networking?</Card.Title>
          <Card.Text>
            Create a new event to start collecting LinkedIn profiles from attendees.
          </Card.Text>
          <Link to="/create-event">
            <Button variant="danger" size="lg" className="px-4 py-2 mt-2">Create New Event</Button>
          </Link>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="warning" className="my-3">
          {error} <br />
          <small>Showing demo content for preview.</small>
        </Alert>
      )}

      <div className="events-section mb-5">
        <h2 className="mb-4">Your Events</h2>
        
        {events.length === 0 ? (
          <div className="text-center my-5 p-5 bg-light rounded">
            <p className="text-muted mb-0">You haven't created any events yet.</p>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {events.map(event => (
              <Col key={event._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{event.name}</Card.Title>
                    <Card.Subtitle className="mb-3 text-muted">
                      {new Date(event.date).toLocaleDateString()} | {event.location}
                    </Card.Subtitle>
                    <Card.Text className="mb-4">
                      {event.description 
                        ? event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '') 
                        : 'No description provided.'}
                    </Card.Text>
                    <div className="d-grid mt-auto">
                      <Link to={`/event/${event._id}`} className="btn btn-primary">View Details</Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Container>
  );
};

export default Home;
