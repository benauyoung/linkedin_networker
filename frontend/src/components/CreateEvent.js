import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, Spinner } from 'react-bootstrap';
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
  const [loadingTimeout, setLoadingTimeout] = useState(null);
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

    // Generate event data with unique identifiers
    const eventCode = 'EVT' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const eventId = 'evt' + Date.now();
    const eventData = {
      ...formData,
      eventCode,
      _id: eventId,
      date: formData.date || new Date().toISOString().split('T')[0], // Default to today if empty
      createdAt: new Date().toISOString()
    };

    try {
      // Set a timeout for the API request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      // Try to send to server
      const response = await axios.post('/events', eventData, { 
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setLoading(false);
      
      // If successful, navigate to the event details page with server data
      navigate(`/event/${response.data._id}`, { 
        state: { event: response.data } 
      });
      
    } catch (err) {
      console.error('Error creating event:', err);
      
      // Check if it's a timeout error
      const errorMessage = err.name === 'AbortError' || err.code === 'ECONNABORTED'
        ? 'Request timed out. Could not connect to server.'
        : 'Unable to connect to server. Created event in demo mode - your data will not be saved to a database.';
      
      // In case of error, generate QR code data URL for the fallback event
      try {
        const registrationUrl = `${window.location.origin}/register/${eventCode}`;
        const canvas = document.createElement('canvas');
        await new Promise(resolve => {
          QRCode.toCanvas(canvas, registrationUrl, { width: 200 }, resolve);
        });
        const qrCodeDataUrl = canvas.toDataURL();
        
        // Create complete fallback event with QR code
        const fallbackEvent = {
          ...eventData,
          qrCodeUrl: qrCodeDataUrl,
          isDemoEvent: true
        };
        
        setLoading(false);
        setError(errorMessage);
        
        // Wait a moment to show the message before redirecting
        setTimeout(() => {
          navigate(`/event/${fallbackEvent._id}`, { 
            state: { event: fallbackEvent, demoMode: true } 
          });
        }, 2000);
      } catch (qrError) {
        // If even the QR code generation fails, still provide a fallback
        setLoading(false);
        setError('Error creating event. Please try again.');
      }
    }
  };

  // Clear loading state after a timeout to prevent UI from being stuck
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        setError('The request is taking too long. Please try again or check your connection.');
      }, 15000); // 15 second max loading time
      
      setLoadingTimeout(timer);
      return () => clearTimeout(timer);
    } else if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
  }, [loading]);

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
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    CREATING...
                  </>
                ) : 'CREATE EVENT'}
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
