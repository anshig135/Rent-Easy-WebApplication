import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import propertyService from '../services/propertyService';
import { toast } from 'react-toastify';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await propertyService.getProperties({ limit: 6 });
      setProperties(response.data.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section text-center">
        <Container>
          <h1 className="display-4 fw-bold mb-4">Find Your Perfect Rental</h1>
          <p className="lead mb-4">
            Discover amazing rental properties that match your lifestyle and budget
          </p>
          <Link to="/properties">
            <Button variant="light" size="lg">
              Browse Properties
            </Button>
          </Link>
        </Container>
      </div>

      {/* Featured Properties */}
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold">Featured Properties</h2>
          <p className="text-muted">Discover our most popular rental listings</p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Row>
            {properties.map((property) => (
              <Col md={6} lg={4} key={property._id} className="mb-4">
                <Card className="property-card h-100">
                  {property.images && property.images.length > 0 ? (
                    <Card.Img
                      variant="top"
                      src={`http://localhost:5000${property.images[0]}`}
                      alt={property.title}
                      className="property-image"
                    />
                  ) : (
                    <div 
                      className="property-image bg-light d-flex align-items-center justify-content-center"
                    >
                      <span className="text-muted">No Image</span>
                    </div>
                  )}
                  
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{property.title}</Card.Title>
                    <Card.Text className="text-muted small mb-2">
                      {property.address.city}, {property.address.state}
                    </Card.Text>
                    <Card.Text className="flex-grow-1">
                      {property.description.substring(0, 100)}...
                    </Card.Text>
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div>
                        <strong className="text-primary h5">
                          ${property.rentPerMonth.toLocaleString()}/mo
                        </strong>
                        <div className="text-muted small">
                          {property.bedrooms} bed • {property.bathrooms} bath
                        </div>
                      </div>
                      <Link to={`/properties/${property._id}`}>
                        <Button variant="primary" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {properties.length > 0 && (
          <div className="text-center mt-4">
            <Link to="/properties">
              <Button variant="outline-primary" size="lg">
                View All Properties
              </Button>
            </Link>
          </div>
        )}

        {/* Stats Section */}
        <Row className="my-5">
          <Col md={4}>
            <div className="stats-card">
              <h3 className="text-primary">500+</h3>
              <p className="mb-0">Available Properties</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stats-card">
              <h3 className="text-success">1000+</h3>
              <p className="mb-0">Happy Tenants</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stats-card">
              <h3 className="text-info">50+</h3>
              <p className="mb-0">Cities Covered</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
