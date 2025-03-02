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

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/events?code=${eventCode}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load event details.');
        setLoading(false);
        console.error('Error fetching event:', err);
      }
    };

    fetchEvent();
  }, [eventCode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateLinkedInUrl = (url) => {
    if (!url) return true; // Optional field
    return url.startsWith('https://www.linkedin.com/') || 
           url.startsWith('http://www.linkedin.com/') || 
           url.startsWith('www.linkedin.com/') || 
           url.startsWith('linkedin.com/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (formData.linkedinUrl && !validateLinkedInUrl(formData.linkedinUrl)) {
      setError('Please enter a valid LinkedIn URL');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post('/attendees', {
        ...formData,
        eventId: event._id
      });
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => {
        navigate(`/event/${event._id}`);
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
              alt="LinkedIn Networker Logo" 
              style={{ width: '50px', marginBottom: '10px' }} 
            />
            <h3 className="logo-text text-danger">Register for Networking Event</h3>
            <h5 className="mb-3 text-danger">{event.name}</h5>
            <p className="text-muted mb-4">
              {new Date(event.date).toLocaleDateString()} | {event.location}
            </p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Registration successful! Redirecting...</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-danger">Your Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={submitting || success}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-danger">Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={submitting || success}
              />
              <Form.Text className="text-muted">
                You'll receive event updates and attendee list at this email
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-danger">LinkedIn Profile URL (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://www.linkedin.com/in/yourprofile"
                disabled={submitting || success}
              />
              <Form.Text className="text-muted">
                Share your LinkedIn profile with other attendees
              </Form.Text>
            </Form.Group>

            <div className="d-grid mt-4">
              <Button 
                variant="danger" 
                type="submit" 
                disabled={submitting || success}
                className="py-2"
              >
                {submitting ? 'Registering...' : 'Complete Registration'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegistrationForm;
