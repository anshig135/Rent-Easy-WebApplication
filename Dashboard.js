import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <div className="text-muted">Welcome back, {user?.name}!</div>
      </div>

      <Row>
        {/* Quick Actions for Renters */}
        {user?.role === 'renter' && (
          <>
            <Col md={6} lg={4} className="mb-4">
              <Card className="dashboard-card h-100">
                <Card.Body className="text-center">
                  <h5 className="text-primary">Browse Properties</h5>
                  <p className="text-muted">Find your perfect rental home</p>
                  <Link to="/properties">
                    <Button variant="primary">View Properties</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4} className="mb-4">
              <Card className="dashboard-card h-100">
                <Card.Body className="text-center">
                  <h5 className="text-success">My Bookings</h5>
                  <p className="text-muted">View your rental requests</p>
                  <Link to="/bookings">
                    <Button variant="success">View Bookings</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        {/* Quick Actions for Property Owners */}
        {user?.role === 'owner' && (
          <>
            <Col md={6} lg={4} className="mb-4">
              <Card className="dashboard-card h-100">
                <Card.Body className="text-center">
                  <h5 className="text-primary">Add Property</h5>
                  <p className="text-muted">List a new rental property</p>
                  <Link to="/add-property">
                    <Button variant="primary">Add Property</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4} className="mb-4">
              <Card className="dashboard-card h-100">
                <Card.Body className="text-center">
                  <h5 className="text-success">My Properties</h5>
                  <p className="text-muted">Manage your listings</p>
                  <Link to="/my-properties">
                    <Button variant="success">View Properties</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4} className="mb-4">
              <Card className="dashboard-card h-100">
                <Card.Body className="text-center">
                  <h5 className="text-info">Booking Requests</h5>
                  <p className="text-muted">Manage rental requests</p>
                  <Link to="/bookings">
                    <Button variant="info">View Requests</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        {/* Quick Actions for Admins */}
        {user?.role === 'admin' && (
          <>
            <Col md={6} lg={4} className="mb-4">
              <Card className="dashboard-card h-100">
                <Card.Body className="text-center">
                  <h5 className="text-primary">Admin Panel</h5>
                  <p className="text-muted">Manage platform</p>
                  <Link to="/admin">
                    <Button variant="primary">Open Admin Panel</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4} className="mb-4">
              <Card className="dashboard-card h-100">
                <Card.Body className="text-center">
                  <h5 className="text-success">View Properties</h5>
                  <p className="text-muted">Browse all properties</p>
                  <Link to="/properties">
                    <Button variant="success">View Properties</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        {/* Common Actions for All Users */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="dashboard-card h-100">
            <Card.Body className="text-center">
              <h5 className="text-secondary">Profile</h5>
              <p className="text-muted">Update your profile information</p>
              <Link to="/profile">
                <Button variant="secondary">Edit Profile</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Role Information */}
      <Card className="dashboard-card">
        <Card.Body>
          <h5>Account Information</h5>
          <Row>
            <Col md={6}>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </Col>
            <Col md={6}>
              <p><strong>Role:</strong> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
              <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
