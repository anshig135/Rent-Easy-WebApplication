import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>RentEasy</Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/properties">
              <Nav.Link>Properties</Nav.Link>
            </LinkContainer>
            
            {isAuthenticated && (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                
                {user?.role === 'owner' && (
                  <NavDropdown title="My Properties" id="property-dropdown">
                    <LinkContainer to="/my-properties">
                      <NavDropdown.Item>View Properties</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/add-property">
                      <NavDropdown.Item>Add Property</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                )}
                
                {user?.role === 'admin' && (
                  <LinkContainer to="/admin">
                    <Nav.Link>Admin Panel</Nav.Link>
                  </LinkContainer>
                )}
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <NavDropdown title={user?.name} id="user-dropdown" align="end">
                <LinkContainer to="/profile">
                  <NavDropdown.Item>Profile</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/bookings">
                  <NavDropdown.Item>My Bookings</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Button variant="outline-light" className="me-2">
                    Login
                  </Button>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Button variant="light">
                    Sign Up
                  </Button>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
