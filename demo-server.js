const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads (demo)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory data store for demo
let users = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@renteasy.com',
    password: '$2a$10$oZsqnlCZsDvYY.H5CuHKreKVMuNCSjE7JvAH7KaXi.TSQQeSR2lum', // password: admin123
    role: 'admin',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$oZsqnlCZsDvYY.H5CuHKreKVMuNCSjE7JvAH7KaXi.TSQQeSR2lum', // password: admin123
    role: 'renter',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: '3',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    password: '$2a$10$oZsqnlCZsDvYY.H5CuHKreKVMuNCSjE7JvAH7KaXi.TSQQeSR2lum', // password: admin123
    role: 'owner',
    isActive: true,
    createdAt: new Date()
  }
];

let properties = [
  {
    _id: '1',
    title: 'Modern Downtown Apartment',
    description: 'Beautiful modern apartment in the heart of downtown with stunning city views.',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    rentPerMonth: 2500,
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['WiFi', 'Parking', 'Gym', 'Pool'],
    images: [],
    availableFrom: new Date(),
    isActive: true,
    isApproved: true,
    owner: '3',
    createdAt: new Date()
  },
  {
    _id: '2',
    title: 'Cozy Suburban House',
    description: 'Spacious family house in a quiet suburban neighborhood with a large backyard.',
    address: {
      street: '456 Oak Avenue',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101'
    },
    rentPerMonth: 3200,
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Parking', 'Garden', 'Fireplace'],
    images: [],
    availableFrom: new Date(),
    isActive: true,
    isApproved: true,
    owner: '3',
    createdAt: new Date()
  }
];

let bookings = [];
let nextId = { user: 4, property: 3, booking: 1 };

// JWT Secret
const JWT_SECRET = 'demo_jwt_secret_key';

// Helper functions
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const findUserById = (id) => users.find(user => user._id === id);
const findUserByEmail = (email) => users.find(user => user.email === email);

// Auth middleware
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = findUserById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'renter' } = req.body;

    // Check if user exists
    if (findUserByEmail(email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      _id: nextId.user.toString(),
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date()
    };

    users.push(user);
    nextId.user++;

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
});

// Property routes
app.get('/api/properties', (req, res) => {
  let filteredProperties = properties.filter(p => p.isActive && p.isApproved);
  
  const { location, minPrice, maxPrice, propertyType, bedrooms, bathrooms, limit = 10 } = req.query;

  if (location) {
    filteredProperties = filteredProperties.filter(p => 
      p.address.city.toLowerCase().includes(location.toLowerCase()) ||
      p.address.state.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (minPrice) {
    filteredProperties = filteredProperties.filter(p => p.rentPerMonth >= parseInt(minPrice));
  }

  if (maxPrice) {
    filteredProperties = filteredProperties.filter(p => p.rentPerMonth <= parseInt(maxPrice));
  }

  if (propertyType) {
    filteredProperties = filteredProperties.filter(p => p.propertyType === propertyType);
  }

  if (bedrooms) {
    filteredProperties = filteredProperties.filter(p => p.bedrooms === parseInt(bedrooms));
  }

  if (bathrooms) {
    filteredProperties = filteredProperties.filter(p => p.bathrooms === parseInt(bathrooms));
  }

  const limitNum = parseInt(limit);
  const result = filteredProperties.slice(0, limitNum);

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

app.get('/api/properties/:id', (req, res) => {
  const property = properties.find(p => p._id === req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  res.json({
    success: true,
    data: property
  });
});

// Demo stats endpoint
app.get('/api/admin/stats', protect, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const stats = {
    users: {
      admin: users.filter(u => u.role === 'admin').length,
      owner: users.filter(u => u.role === 'owner').length,
      renter: users.filter(u => u.role === 'renter').length,
      total: users.length
    },
    properties: {
      active: properties.filter(p => p.isActive).length,
      approved: properties.filter(p => p.isApproved).length,
      total: properties.length
    },
    bookings: {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      total: 0
    }
  };

  res.json({
    success: true,
    data: stats
  });
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'RentEasy API is running!', 
    note: 'This is a demo version with in-memory data store.',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/auth/me',
      'GET /api/properties'
    ],
    demoAccounts: [
      { email: 'admin@renteasy.com', password: 'admin123', role: 'admin' },
      { email: 'john@example.com', password: 'admin123', role: 'renter' },
      { email: 'sarah@example.com', password: 'admin123', role: 'owner' }
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 RentEasy Demo Server running on port ${PORT}`);
  console.log(`📋 Demo accounts available:`);
  console.log(`   Admin: admin@renteasy.com / admin123`);
  console.log(`   Renter: john@example.com / admin123`);
  console.log(`   Owner: sarah@example.com / admin123`);
  console.log(`🌐 Visit http://localhost:${PORT} for API info`);
});
