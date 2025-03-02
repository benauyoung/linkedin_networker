import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavigationBar from './components/NavigationBar';
import Home from './components/Home';
import CreateEvent from './components/CreateEvent';
import EventDetails from './components/EventDetails';
import RegistrationForm from './components/RegistrationForm';
import AttendeeList from './components/AttendeeList';

function App() {
  return (
    <Router>
      <NavigationBar />
      <Container className="py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/register/:eventCode" element={<RegistrationForm />} />
          <Route path="/attendees/:eventId" element={<AttendeeList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
