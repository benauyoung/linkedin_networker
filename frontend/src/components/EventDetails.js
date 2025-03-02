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
  const [completingEvent, setCompletingEvent] = useState(false);
  const [completeResult, setCompleteResult] = useState(null);
  
  useEffect(() => {
    // Check if we have passed event data from the state (from CreateEvent)
    if (location.state && location.state.event) {
      setEvent(location.state.event);
      setAttendees([]); // No attendees for a new event
      
      // If this is a demo mode event, show a notice
      if (location.state.demoMode) {
        setError('Demo Mode: This event data is not saved to a database and will be lost on page refresh.');
      }
      
      setLoading(false);
      return;
    }
    
    const fetchEventDetails = async () => {
      try {
        console.log('Fetching event with ID:', id);
        // Fetch event details
        const eventResponse = await axios.get(`/events?id=${id}`);
        console.log('Event data:', eventResponse.data);
        setEvent(eventResponse.data);
        
        // Fetch attendees for this event
        try {
          const attendeesResponse = await axios.get(`/attendees?eventId=${id}`);
          setAttendees(attendeesResponse.data);
        } catch (attendeesError) {
          console.error('Error fetching attendees:', attendeesError);
          setAttendees([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        
        // Check if it's a demo event or dynamically generated
        if (id.startsWith('evt') || id.startsWith('demo')) {
          // Set mock data for the event
          setEvent({
            _id: id,
            name: 'Demo Event',
            date: new Date().toISOString(),
            location: 'Virtual Event',
            description: 'This is a demonstration event.',
            eventCode: `DEMO${Math.floor(Math.random() * 900) + 100}`,
            qrCodeUrl: '',
            isDemoEvent: true
          });
          setAttendees([]);
          setError('Demo Mode: This is a demonstration event with mock data.');
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
  
  const confirmCompleteEvent = async () => {
    if (!event || !event._id) {
      setError('Cannot complete event: Invalid event data');
      setShowCompleteModal(false);
      return;
    }
    
    setCompletingEvent(true);
    
    try {
      const response = await axios.post('/complete-event', {
        eventId: event._id
      });
      
      setCompleteResult({
        success: true,
        message: 'Event completed successfully! Follow-up emails have been sent to attendees.'
      });
      
      // Mark the event as completed locally
      setEvent(prev => ({
        ...prev,
        isCompleted: true
      }));
      
    } catch (error) {
      console.error('Error completing event:', error);
      setCompleteResult({
        success: false,
        message: `Failed to complete event: ${error.response?.data?.error || error.message}`
      });
    } finally {
      setCompletingEvent(false);
      setShowCompleteModal(false);
    }
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
          Event not found or has been deleted.
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
      
      {completeResult && (
        <Alert variant={completeResult.success ? 'success' : 'danger'} dismissible onClose={() => setCompleteResult(null)}>
          {completeResult.message}
        </Alert>
      )}
      
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
                onClick={() => {
                  // Open a modal or implement view functionality
                  console.log('Viewing attendees:', attendees);
                  alert(`${attendees.length} attendees registered for this event: ${attendees.map(a => a.name).join(', ')}`);
                }}
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
              {!event.isCompleted ? (
                <Button
                  variant="danger"
                  onClick={handleCompleteEvent}
                >
                  Complete Event
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  disabled
                >
                  Event Completed
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Complete Event Modal */}
      <Modal show={showCompleteModal} onHide={() => !completingEvent && setShowCompleteModal(false)}>
        <Modal.Header closeButton={!completingEvent}>
          <Modal.Title>Complete Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to complete this event? This will:</p>
          <ul>
            <li>Mark the event as finished</li>
            <li>Send follow-up emails to all registered attendees</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)} disabled={completingEvent}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmCompleteEvent} disabled={completingEvent}>
            {completingEvent ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                Processing...
              </>
            ) : (
              'Complete Event'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventDetails;
