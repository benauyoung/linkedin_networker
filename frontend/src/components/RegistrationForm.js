import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedinUrl: ''
  });

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    params: {},
    errors: [],
    apiResponses: []
  });
  const { eventCode } = useParams();
  const navigate = useNavigate();

  // Log important information
  console.log('⚡ RegistrationForm - Initializing with eventCode:', eventCode);
  console.log('⚡ Window location:', window.location.href);

  useEffect(() => {
    document.title = 'EVENT CONNECT - Registration';
    
    // Add this to help with debugging
    window.onerror = function(message, source, lineno, colno, error) {
      console.error('Global error caught:', message, error);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, { message, source, lineno, colno }]
      }));
      return false;
    };
    
    setDebugInfo(prev => ({
      ...prev,
      params: { eventCode }
    }));
    
    const fetchEvent = async () => {
      setLoading(true);
      try {
        console.log('⚡ Fetching event using event code:', eventCode);
        
        // First try with eventCode parameter
        console.log('⚡ Attempting to fetch with eventCode parameter');
        const eventCodeUrl = `/events?eventCode=${eventCode}`;
        console.log('⚡ Request URL:', eventCodeUrl);
        
        let response = await axios.get(eventCodeUrl);
        console.log('⚡ Response from eventCode query:', response);
        
        setDebugInfo(prev => ({
          ...prev,
          apiResponses: [...prev.apiResponses, { 
            type: 'eventCode query', 
            url: eventCodeUrl,
            status: response.status,
            data: response.data
          }]
        }));
        
        // If no data returned, try with id parameter as fallback
        if (!response.data || Object.keys(response.data).length === 0) {
          console.log('⚡ No event found with eventCode, trying with id parameter');
          const idUrl = `/events?id=${eventCode}`;
          console.log('⚡ Request URL:', idUrl);
          
          response = await axios.get(idUrl);
          console.log('⚡ Response from id query:', response);
          
          setDebugInfo(prev => ({
            ...prev,
            apiResponses: [...prev.apiResponses, { 
              type: 'id query', 
              url: idUrl,
              status: response.status,
              data: response.data
            }]
          }));
        }
        
        if (response.data && Object.keys(response.data).length > 0) {
          console.log('⚡ Event found for registration:', response.data);
          setEvent(response.data);
        } else {
          console.error('⚡ Event not found with either eventCode or id parameter');
          setError('Event not found.');
        }
        setLoading(false);
      } catch (err) {
        console.error('⚡ Error fetching event:', err);
        console.error('⚡ Error details:', err.response ? err.response.data : 'No response data');
        setError('Failed to load event details. Please try again later.');
        
        setDebugInfo(prev => ({
          ...prev,
          errors: [...prev.errors, { 
            message: err.message, 
            response: err.response ? {
              status: err.response.status,
              data: err.response.data
            } : 'No response'
          }]
        }));
        
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Simple validation
    if (!formData.name || !formData.email) {
      setError('Name and email are required fields');
      setSubmitting(false);
      return;
    }

    try {
      console.log('⚡ Submitting registration with data:', {
        ...formData,
        eventId: event._id || event.eventCode
      });
      
      await axios.post('/attendees', {
        ...formData,
        eventId: event._id || event.eventCode
      });
      
      setSuccess(true);
      setSubmitting(false);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
      console.error('⚡ Error registering:', err);
    }
  };

  // Show debug panel in non-production environments or if there are errors
  const showDebugPanel = process.env.NODE_ENV !== 'production' || debugInfo.errors.length > 0 || error;

  // Always show something, even if we're loading or have an error
  const renderAppLogo = () => (
    <div className="text-center mb-4">
      {/* Try to load SVG from public folder, with inline SVG fallback */}
      <div style={{ height: '40px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/assets/walking-logo.svg" 
          alt="EVENT CONNECT Logo" 
          height="40"
          onError={(e) => {
            e.target.style.display = 'none';
            document.getElementById('fallback-svg').style.display = 'block';
          }}
        />
        <svg 
          id="fallback-svg" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 50 50" 
          width="40" 
          height="40" 
          style={{display: 'none'}}
        >
          <circle cx="25" cy="10" r="6" fill="#dc3545" />
          <line x1="25" y1="16" x2="25" y2="30" stroke="#dc3545" stroke-width="3" />
          <line x1="25" y1="20" x2="15" y2="18" stroke="#dc3545" stroke-width="3" />
          <line x1="25" y1="20" x2="35" y2="18" stroke="#dc3545" stroke-width="3" />
          <line x1="25" y1="30" x2="18" y2="42" stroke="#dc3545" stroke-width="3" />
          <line x1="25" y1="30" x2="32" y2="42" stroke="#dc3545" stroke-width="3" />
        </svg>
      </div>
      <h2 className="registration-title text-danger mb-0">EVENT CONNECT</h2>
      <p className="text-muted">Event Registration</p>
    </div>
  );

  return (
    <Container className="py-4">
      {/* Debug panel - will display at the top */}
      {showDebugPanel && (
        <Card className="mb-4 border-warning">
          <Card.Header className="bg-warning text-dark">
            <strong>Debug Information</strong>
          </Card.Header>
          <Card.Body>
            <h5>Registration Component Debug</h5>
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>Event Code from URL:</strong> {eventCode || 'None'}</p>
            <p><strong>Browser:</strong> {navigator.userAgent}</p>
            <p><strong>Component State:</strong> {loading ? 'Loading' : error ? 'Error' : event ? 'Event Loaded' : 'No Event'}</p>
            
            {debugInfo.errors.length > 0 && (
              <div className="mt-3">
                <h6>Errors:</h6>
                <pre style={{maxHeight: '200px', overflow: 'auto'}}>
                  {JSON.stringify(debugInfo.errors, null, 2)}
                </pre>
              </div>
            )}
            
            {debugInfo.apiResponses.length > 0 && (
              <div className="mt-3">
                <h6>API Responses:</h6>
                <pre style={{maxHeight: '200px', overflow: 'auto'}}>
                  {JSON.stringify(debugInfo.apiResponses, null, 2)}
                </pre>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading registration form...</p>
        </div>
      ) : error && !event ? (
        <Card className="registration-form border border-danger">
          <Card.Body className="text-center">
            {renderAppLogo()}
            <Alert variant="danger">
              <h4>Error Loading Event</h4>
              <p>{error}</p>
              <Button 
                variant="outline-danger"
                onClick={() => window.location.reload()}
                className="mt-3"
              >
                Try Again
              </Button>
            </Alert>
          </Card.Body>
        </Card>
      ) : event ? (
        <Card className="registration-form border border-danger">
          <Card.Body>
            {renderAppLogo()}

            <div className="event-info mb-4">
              <h3>{event.name}</h3>
              <p className="mb-1">
                <i className="bi bi-calendar-event me-2"></i>
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="mb-1">
                <i className="bi bi-geo-alt me-2"></i>
                {event.location}
              </p>
              {event.description && (
                <p className="event-description mt-3">
                  {event.description}
                </p>
              )}
            </div>

            {success ? (
              <Alert variant="success">
                <h4>Registration Successful!</h4>
                <p>Thank you for registering. You will be redirected to the homepage.</p>
              </Alert>
            ) : (
              <>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>LinkedIn Profile URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <Form.Text className="text-muted">
                      Your LinkedIn profile will be shared with other attendees for networking
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="danger" 
                      type="submit" 
                      disabled={submitting}
                      className="registration-submit-btn"
                    >
                      {submitting ? 'Registering...' : 'Register Now'}
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className="registration-form border border-danger">
          <Card.Body className="text-center">
            {renderAppLogo()}
            <Alert variant="warning">
              <h4>No Event Found</h4>
              <p>We couldn't find the event you're looking for. Please check the URL and try again.</p>
              <Button 
                variant="outline-danger"
                href="/"
                className="mt-3"
              >
                Go to Homepage
              </Button>
            </Alert>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default RegistrationForm;
