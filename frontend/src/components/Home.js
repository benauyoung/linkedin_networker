import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Container } from 'react-bootstrap';
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
        const response = await axios.get('/api/events');
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
      <div className="welcome-header">
        <h1>Welcome to EVENT CONNECT</h1>
        <p>Create and manage professional networking events, collect LinkedIn profiles from attendees</p>
      </div>

      <div className="create-event-card">
        <Card className="text-center">
          <Card.Body>
            <img 
              src="/assets/walking-logo.svg" 
              alt="EVENT CONNECT Logo" 
              style={{ width: '60px', marginBottom: '15px' }} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/60x60?text=EC';
              }}
            />
            <Card.Title>Ready to start networking?</Card.Title>
            <Card.Text>
              Create a new event to start collecting LinkedIn profiles from attendees.
            </Card.Text>
            <Link to="/create-event">
              <Button variant="danger" size="lg" className="create-btn">Create New Event</Button>
            </Link>
          </Card.Body>
        </Card>
      </div>

      {error && (
        <Alert variant="warning" className="my-3">
          {error} <br />
          <small>Showing demo content for preview.</small>
        </Alert>
      )}

      <div className="events-section">
        <h2>Your Events</h2>
        
        {events.length === 0 ? (
          <div className="text-center my-4 text-muted">
            <p>You haven't created any events yet.</p>
          </div>
        ) : (
          <div className="event-cards">
            {events.map(event => (
              <Card key={event._id} className="event-card">
                <Card.Body>
                  <Card.Title>{event.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {new Date(event.date).toLocaleDateString()} | {event.location}
                  </Card.Subtitle>
                  <Card.Text>
                    {event.description 
                      ? event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '') 
                      : 'No description provided.'}
                  </Card.Text>
                  <Link to={`/event/${event._id}`}>
                    <Button variant="primary">View Details</Button>
                  </Link>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default Home;
