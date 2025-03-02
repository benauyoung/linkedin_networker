import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Row, Col, Alert, Modal } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import axios from '../axiosConfig';
import moment from 'moment';

const EventDetails = () => {
  const { id } = useParams();
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
        setError('Failed to load event details');
        setLoading(false);
        console.error('Error fetching event details:', err);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleCompleteEvent = async () => {
    try {
      const response = await axios.put(`/events/${id}`, {
        ...event,
        isCompleted: true
      });
      setEvent(response.data);
      setShowCompleteModal(false);
    } catch (err) {
      setError('Failed to complete event. Please try again.');
      console.error('Error completing event:', err);
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading event details...</div>;
  }

  if (!event) {
    return <Alert variant="danger">Event not found.</Alert>;
  }

  const registrationUrl = `${window.location.origin}/register/${event.eventCode}`;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{event.name}</h1>
        <Link to="/">
          <Button variant="outline-secondary">Back to Events</Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Event Details</Card.Title>
              <Card.Text>
                <strong>Date:</strong> {moment(event.date).format('MMMM Do, YYYY')}<br />
                <strong>Location:</strong> {event.location}<br />
                <strong>Organizer:</strong> {event.organizer}<br />
                <strong>Status:</strong> {event.isCompleted ? 'Completed' : 'Active'}<br />
                {event.description && (
                  <><strong>Description:</strong> {event.description}</>
                )}
              </Card.Text>
              
              {!event.isCompleted ? (
                <Button 
                  variant="success" 
                  onClick={() => setShowCompleteModal(true)}
                >
                  Mark as Completed
                </Button>
              ) : (
                <div className="mt-3">
                  <Alert variant="success">
                    This event has been completed. 
                    {event.emailsSent ? ' Emails have been sent to attendees.' : ' Emails are being sent to attendees.'}
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Attendees ({attendees.length})</Card.Title>
              {attendees.length === 0 ? (
                <Alert variant="info">No attendees have registered for this event yet.</Alert>
              ) : (
                <div className="mt-3">
                  {attendees.map(attendee => (
                    <Card key={attendee._id} className="mb-2 attendee-card">
                      <Card.Body>
                        <Row>
                          <Col xs={9}>
                            <Card.Title>{attendee.name}</Card.Title>
                            <Card.Text>
                              <small>{attendee.email}</small>
                            </Card.Text>
                          </Col>
                          <Col xs={3} className="text-end">
                            <a 
                              href={attendee.linkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-linkedin"
                            >
                              LinkedIn Profile
                            </a>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>QR Code for Registration</Card.Title>
              <div className="qr-code-container">
                <QRCode 
                  value={registrationUrl} 
                  size={200}
                  level="H"
                  renderAs="canvas"
                />
                <div className="mt-3 text-center">
                  <p className="mb-1">Registration Link:</p>
                  <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
                    {registrationUrl}
                  </a>
                </div>
              </div>
              <div className="d-grid mt-3">
                <Button 
                  variant="outline-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(registrationUrl);
                    alert('Registration URL copied to clipboard!');
                  }}
                >
                  Copy Registration URL
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Complete Event Modal */}
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to mark this event as completed?</p>
          <p>This will:</p>
          <ul>
            <li>Change the event status to "Completed"</li>
            <li>Send emails to all registered attendees with a link to the attendee list</li>
          </ul>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCompleteEvent}>
            Complete Event
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EventDetails;
