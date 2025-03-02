import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import QRCode from 'qrcode.react';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    organizer: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdEvent, setCreatedEvent] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Add eventCode generation on the client side
      const eventCode = 'EVT' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const eventData = {
        ...formData,
        eventCode,
        _id: 'evt' + Date.now() // Generate a fake ID for mock data
      };

      const response = await axios.post('/events', eventData);
      setLoading(false);
      
      if (response.data && response.data._id) {
        navigate(`/event/${response.data._id}`);
      } else {
        // If the server doesn't return data, use our generated data
        setCreatedEvent(eventData);
        navigate(`/event/${eventData._id}`);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      
      // Create a fallback event in case of API error
      const fallbackEvent = {
        ...formData,
        eventCode: 'EVT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        _id: 'evt' + Date.now()
      };
      
      setLoading(false);
      setError('Could not connect to server. Creating event in demo mode.');
      
      // Add a delay to show the error message before redirecting
      setTimeout(() => {
        navigate(`/event/${fallbackEvent._id}`, { state: { event: fallbackEvent } });
      }, 1500);
    }
  };

  return (
    <div>
      <Card className="card-form mt-4">
        <Card.Body>
          <h3 className="form-header">
            <img 
              src="/assets/walking-logo.svg" 
              alt="EVENT CONNECT Logo" 
              className="logo-small" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/30x30?text=EC";
              }}
            />
            Create Your Networking Event
          </h3>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter event location"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Your Email</Form.Label>
              <Form.Control
                type="email"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
              />
            </Form.Group>

            <div className="d-grid mt-4">
              <Button
                variant="danger"
                type="submit"
                disabled={loading}
                className="create-event-btn"
              >
                {loading ? 'CREATING...' : 'CREATE EVENT'}
              </Button>
            </div>
          </Form>
          
          <div className="qr-code-scan-box mt-4">
            <div className="d-flex justify-content-end">
              <div className="text-center">
                <div className="scan-text">SCAN TO REGISTER</div>
                {createdEvent ? (
                  <QRCode 
                    value={`${window.location.origin}/register/${createdEvent.eventCode}`}
                    size={80}
                    level="H"
                    renderAs="svg"
                  />
                ) : (
                  <QRCode 
                    value="https://example.com/placeholder"
                    size={80}
                    level="H"
                    renderAs="svg"
                  />
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateEvent;
