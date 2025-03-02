import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  // Logo fallback handler
  const handleLogoError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/30x30?text=EC';
  };

  return (
    <>
      <div className="brand-header" style={{ backgroundColor: '#2196F3' }}>
        <img 
          src="/assets/walking-logo.svg" 
          alt="EVENT CONNECT Logo" 
          className="event-connect-logo"
          onError={handleLogoError}
        />
        EVENT CONNECT
      </div>
      <Navbar expand="lg" className="navbar-custom shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img 
              src="/assets/walking-logo.svg" 
              alt="EVENT CONNECT Logo" 
              className="d-inline-block align-top"
              style={{ width: '30px', marginRight: '10px' }}
              onError={handleLogoError}
            />
            <span className="d-none d-sm-inline">EVENT CONNECT</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
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
