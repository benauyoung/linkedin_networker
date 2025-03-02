import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Modal, Container, Spinner } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import axios from '../axiosConfig';
import moment from 'moment';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  useEffect(() => {
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
        
        // Check if it's a demo event
        if (id === 'demo1') {
          // Set mock data for the demo event
          setEvent({
            _id: 'demo1',
            name: 'Demo Tech Conference',
            date: '2023-04-15T00:00:00.000Z',
            location: 'Virtual Event',
            description: 'This is a demonstration event while the API is being configured.',
            registrationUrl: 'https://example.com/demo-event'
          });
          setAttendees([
            {
              _id: 'demo-attendee-1',
              name: 'John Doe',
              email: 'john@example.com',
              linkedinProfile: 'https://linkedin.com/in/johndoe',
              eventId: 'demo1',
              registrationDate: new Date().toISOString()
            }
          ]);
          setError('Using demo data while API is being configured');
        } else {
          setError('Failed to load event details. The API might be unavailable.');
        }
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleComplete = async () => {
    if (error) {
      navigate('/');
      return;
    }
    
    try {
      await axios.put(`/events/${id}/complete`);
      setShowCompleteModal(true);
    } catch (err) {
      setError('Failed to complete the event. Try again later.');
      console.error('Error completing event:', err);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status" variant="danger">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!event && !error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Event not found. It may have been deleted.</Alert>
        <Link to="/" className="btn btn-primary mt-3">Back to Events</Link>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {error && (
        <Alert variant="warning" className="my-3">
          {error}
          {id === 'demo1' && <div><small>Showing demo content for preview.</small></div>}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">{event?.name || 'Event Details'}</h1>
        <Link to="/" className="btn btn-outline-primary">Back to Events</Link>
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Event Information</Card.Title>
          <Card.Text>
            <strong>Date:</strong> {event?.date ? moment(event.date).format('MMMM D, YYYY') : 'N/A'}<br />
            <strong>Location:</strong> {event?.location || 'N/A'}<br />
            <strong>Description:</strong> {event?.description || 'No description provided.'}
          </Card.Text>
          <div className="d-flex justify-content-between mt-4">
            <Button 
              variant="danger" 
              onClick={handleComplete}
              disabled={error && id !== 'demo1'}
            >
              Mark as Complete
            </Button>
            
            <div className="text-center">
              <h5>Registration QR Code</h5>
              {event?.registrationUrl ? (
                <QRCode value={event.registrationUrl} size={150} />
              ) : (
                <div className="border d-flex justify-content-center align-items-center" style={{ width: 150, height: 150 }}>
                  <span className="text-muted">No URL available</span>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      
      <h2>Attendees ({attendees.length})</h2>
      {attendees.length === 0 ? (
        <Alert variant="info">No attendees have registered for this event yet.</Alert>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>LinkedIn Profile</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map(attendee => (
                <tr key={attendee._id}>
                  <td>{attendee.name}</td>
                  <td>{attendee.email}</td>
                  <td>
                    <a href={attendee.linkedinProfile} target="_blank" rel="noopener noreferrer">
                      View Profile
                    </a>
                  </td>
                  <td>{moment(attendee.registrationDate).format('MMM D, YYYY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Event Completed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This event has been marked as complete. Thank you for using LinkedIn Networker!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return to Events
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventDetails;
