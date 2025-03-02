import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading events. Please try refreshing the page.');
        setLoading(false);
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="danger">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading events...</p>
      </div>
    );
  }

  return (
    <Container className="home-container">
      <div className="welcome-header">
        <h1>Welcome to LinkedIn Networker</h1>
        <p>Create and manage professional networking events, collect LinkedIn profiles from attendees</p>
      </div>

      <div className="create-event-card">
        <Card className="text-center">
          <Card.Body>
            <img 
              src="/assets/walking-logo.svg" 
              alt="LinkedIn Networker Logo" 
              style={{ width: '60px', marginBottom: '15px' }} 
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

      {error && <Alert variant="danger">{error}</Alert>}

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
                  <Link to={`/events/${event._id}`}>
                    <Button variant="outline-danger">View Details</Button>
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
