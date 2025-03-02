import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';

const AttendeeList = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const eventResponse = await axios.get(`/api/events/${eventId}`);
        setEvent(eventResponse.data);
        
        // Fetch attendees
        const attendeesResponse = await axios.get(`/api/events/${eventId}/attendees`);
        setAttendees(attendeesResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [eventId]);

  const handleConnectAll = () => {
    // Open multiple LinkedIn profiles in new tabs
    attendees.forEach(attendee => {
      window.open(attendee.linkedinUrl, '_blank');
    });
  };

  if (loading) {
    return <div className="text-center my-5">Loading...</div>;
  }

  if (!event) {
    return <Alert variant="danger">Event not found</Alert>;
  }

  return (
    <Container className="attendee-list-container">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="text-center">Thank You for Attending!</Card.Title>
          <div className="text-center mb-3">
            <h2>{event.name}</h2>
            <p className="text-muted">
              {moment(event.date).format('MMMM Do, YYYY')} at {event.location}
            </p>
          </div>
          
          <p className="text-center">
            Here's a list of all attendees. You can connect with them on LinkedIn.
          </p>
          
          {attendees.length > 1 && (
            <div className="d-flex justify-content-center mb-4">
              <Button 
                variant="primary" 
                onClick={handleConnectAll}
                size="lg"
              >
                Connect with All Attendees
              </Button>
            </div>
          )}
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {attendees.length === 0 ? (
            <Alert variant="info">No attendees found for this event.</Alert>
          ) : (
            <Row>
              {attendees.map(attendee => (
                <Col md={6} key={attendee._id} className="mb-3">
                  <Card className="h-100 attendee-card">
                    <Card.Body>
                      <Card.Title>{attendee.name}</Card.Title>
                      <Card.Text>
                        <a href={`mailto:${attendee.email}`}>{attendee.email}</a>
                      </Card.Text>
                      <a 
                        href={attendee.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-linkedin"
                      >
                        Connect on LinkedIn
                      </a>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
      
      <div className="text-center">
        <Link to="/">
          <Button variant="outline-secondary">Back to Events</Button>
        </Link>
      </div>
    </Container>
  );
};

export default AttendeeList;
