import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
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
  const { eventCode } = useParams();
  const navigate = useNavigate();

  console.log('RegistrationForm - Initializing with eventCode:', eventCode);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        console.log('Fetching event using event code:', eventCode);
        
        // First try with eventCode parameter
        console.log('Attempting to fetch with eventCode parameter');
        let response = await axios.get(`/events?eventCode=${eventCode}`);
        console.log('Response from eventCode query:', response);
        
        // If no data returned, try with id parameter as fallback
        if (!response.data || Object.keys(response.data).length === 0) {
          console.log('No event found with eventCode, trying with id parameter');
          response = await axios.get(`/events?id=${eventCode}`);
          console.log('Response from id query:', response);
        }
        
        if (response.data && Object.keys(response.data).length > 0) {
          console.log('Event found for registration:', response.data);
          setEvent(response.data);
        } else {
          console.error('Event not found with either eventCode or id parameter');
          setError('Event not found.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        console.error('Error details:', err.response ? err.response.data : 'No response data');
        setError('Failed to load event details. Please try again later.');
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
      console.log('Submitting registration with data:', {
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
      console.error('Error registering:', err);
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading registration form...</div>;
  }

  if (!event) {
    return (
      <div className="text-center my-5 text-danger">
        Event not found or has been deleted
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Card className="registration-form border border-danger">
        <Card.Body>
          <div className="text-center mb-4">
            <img 
              src="/assets/walking-logo.svg" 
              alt="EVENT CONNECT Logo" 
              height="40" 
              className="mb-2"
            />
            <h2 className="registration-title text-danger mb-0">EVENT CONNECT</h2>
            <p className="text-muted">Event Registration</p>
          </div>

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
    </div>
  );
};

export default RegistrationForm;
