import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <>
      <div className="brand-header" style={{ backgroundColor: '#FF4D4D' }}>
        <img 
          src="/assets/walking-logo.svg" 
          alt="LinkedIn Networker Logo" 
          className="event-connect-logo" 
        />
        LINKEDIN NETWORKER
      </div>
      <Navbar expand="lg" className="navbar-custom shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img 
              src="/assets/walking-logo.svg" 
              alt="LinkedIn Networker Logo" 
              className="logo-small" 
            />
            <span className="logo-text">LinkedIn Networker</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/create-event">Create Event</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavigationBar;
