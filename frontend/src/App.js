import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import NavigationBar from './components/NavigationBar';
import Home from './components/Home';
import CreateEvent from './components/CreateEvent';
import EventDetails from './components/EventDetails';
import RegistrationForm from './components/RegistrationForm';
import AttendeeList from './components/AttendeeList';
import axios from './axiosConfig';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by error boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center">
          <h1>Something went wrong</h1>
          <Alert variant="danger" className="mt-3">
            The application encountered an error. Please try refreshing the page.
          </Alert>
          <button
            className="btn btn-danger mt-3"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </button>
        </Container>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [appReady, setAppReady] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    // Set app as ready after a small delay to ensure all components are loaded
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 1500); // Increased delay to ensure everything loads
    
    // Check server connectivity
    const checkConnection = async () => {
      try {
        await axios.get('/api/events');
        setDemoMode(false);
        setConnectionError(false);
      } catch (error) {
        console.log('Unable to connect to the server. Running in demo mode.');
        setDemoMode(true);
        setConnectionError(true);
      }
    };
    
    checkConnection();
    
    return () => clearTimeout(timer);
  }, []);

  // Prevent hydration errors by rendering a simple loading state initially
  if (typeof window !== 'undefined' && !appReady) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <h3 className="text-danger mb-3">EVENT CONNECT</h3>
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="app-container">
          <NavigationBar />
          
          {demoMode && (
            <Alert variant="warning" className="text-center mb-0">
              <strong>Demo Mode Active:</strong> Unable to connect to the server. Your data will not be saved.
            </Alert>
          )}
          
          <Container className="mt-4 main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/register/:eventCode" element={<RegistrationForm />} />
              <Route path="/attendees/:eventId" element={<AttendeeList />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
