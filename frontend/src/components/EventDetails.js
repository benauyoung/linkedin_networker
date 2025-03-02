import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Alert, Modal, Container, Spinner } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import axios from '../axiosConfig';
import moment from 'moment';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  useEffect(() => {
    // Check if we have passed event data from the state (from CreateEvent)
    if (location.state && location.state.event) {
      setEvent(location.state.event);
      setAttendees([]); // No attendees for a new event
      setLoading(false);
      return;
    }
    
    const fetchEventDetails = async () => {
      try {
        // Fetch event details
        const eventResponse = await axios.get(`/events/${id}`);
        setEvent(eventResponse.data);
        
        // Fetch attendees for this event
        const attendeesResponse = await axios.get(`/attendees/event/${id}`);
        setAttendees(attendeesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        
        // Check if it's a demo event or dynamically generated
        if (id.startsWith('evt')) {
          // Extract date and time from ID if it was dynamically generated
          const idTime = id.replace(/^evt/, '');
          const eventDate = new Date(parseInt(idTime, 10) || Date.now());
          
          // Set mock data for the event
          setEvent({
            _id: id,
            name: 'Demo Event',
            date: eventDate.toISOString(),
            location: 'Virtual Event',
            description: 'This is a demonstration event while the API is being configured.',
            eventCode: `DEMO${Math.floor(Math.random() * 900) + 100}`
          });
          setAttendees([]);
          setError('Using demo mode: This event data is not saved to a database.');
        } else {
          setError('Failed to load event details. The event may not exist or the server is unavailable.');
        }
        
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, location.state]);
  
  const handleCompleteEvent = () => {
    setShowCompleteModal(true);
  };
  
  const confirmCompleteEvent = () => {
    // In a real app, we would call an API to mark the event as completed
    setShowCompleteModal(false);
    navigate('/');
  };
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }
  
  if (!event) {
    return (
      <Container>
        <Alert variant="danger">
          Event not found or an error occurred.
          <div className="mt-3">
            <Link to="/" className="btn btn-outline-danger">Return to Home</Link>
          </div>
        </Alert>
      </Container>
    );
  }
  
  // Format event date
  const eventDate = moment(event.date).format('MMMM D, YYYY');
  
  return (
    <Container className="py-4">
      {error && <Alert variant="warning">{error}</Alert>}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="card-title mb-1">{event.name}</h2>
              <p className="text-muted mb-0">
                <i className="bi bi-calendar me-1"></i> {eventDate}
              </p>
              <p className="text-muted mb-0">
                <i className="bi bi-geo-alt me-1"></i> {event.location}
              </p>
            </div>
            <div className="text-center">
              <div className="mb-2">
                <small className="d-block text-muted mb-1">Event Code</small>
                <span className="event-code">{event.eventCode || 'CODE123'}</span>
              </div>
              <QRCode 
                value={`${window.location.origin}/register/${event.eventCode || 'CODE123'}`}
                size={100}
                level="H"
                renderAs="svg"
              />
            </div>
          </div>
          
          <p className="event-description">
            {event.description || 'No description provided.'}
          </p>
          
          <hr />
          
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted">
                <i className="bi bi-people me-1"></i> {attendees.length} Attendees
              </span>
              <Button 
                as={Link} 
                to={`/attendees/${event._id}`}
                variant="link"
                className="p-0 ms-2"
                style={{ color: 'var(--bs-danger)' }}
              >
                View List
              </Button>
            </div>
            <div>
              <Button
                variant="outline-danger"
                className="me-2"
                as={Link}
                to={`/register/${event.eventCode || 'CODE123'}`}
              >
                Registration Page
              </Button>
              <Button
                variant="danger"
                onClick={handleCompleteEvent}
              >
                Complete Event
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Complete Event Modal */}
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to complete this event? This will mark the event as finished.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmCompleteEvent}>
            Complete Event
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventDetails;
