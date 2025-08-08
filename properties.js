const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/properties/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @desc    Get all approved properties with filtering
// @route   GET /api/properties
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = { isActive: true, isApproved: true };

    // Build filter object
    const { 
      location, 
      minPrice, 
      maxPrice, 
      propertyType, 
      bedrooms, 
      bathrooms,
      page = 1,
      limit = 10 
    } = req.query;

    if (location) {
      query.$or = [
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.state': { $regex: location, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.rentPerMonth = {};
      if (minPrice) query.rentPerMonth.$gte = parseInt(minPrice);
      if (maxPrice) query.rentPerMonth.$lte = parseInt(maxPrice);
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (bedrooms) {
      query.bedrooms = parseInt(bedrooms);
    }

    if (bathrooms) {
      query.bathrooms = parseInt(bathrooms);
    }

    // Pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const properties = await Property.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      count: properties.length,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        total
      },
      data: properties
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner only)
router.post('/', protect, authorize('owner'), upload.array('images', 5), [
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('address.street', 'Street address is required').not().isEmpty(),
  body('address.city', 'City is required').not().isEmpty(),
  body('address.state', 'State is required').not().isEmpty(),
  body('address.zipCode', 'Zip code is required').not().isEmpty(),
  body('rentPerMonth', 'Rent per month is required').isNumeric(),
  body('propertyType', 'Property type is required').not().isEmpty(),
  body('bedrooms', 'Number of bedrooms is required').isNumeric(),
  body('bathrooms', 'Number of bathrooms is required').isNumeric(),
  body('availableFrom', 'Available from date is required').isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      address,
      rentPerMonth,
      propertyType,
      bedrooms,
      bathrooms,
      amenities,
      availableFrom
    } = req.body;

    // Handle file uploads
    const images = req.files ? req.files.map(file => `/uploads/properties/${file.filename}`) : [];

    const property = new Property({
      title,
      description,
      address: JSON.parse(address), // Parse address object from form data
      rentPerMonth,
      propertyType,
      bedrooms,
      bathrooms,
      amenities: amenities ? JSON.parse(amenities) : [],
      images,
      availableFrom,
      owner: req.user.id
    });

    await property.save();

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner of property only)
router.put('/:id', protect, authorize('owner'), upload.array('images', 5), async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Make sure user is property owner
    if (property.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const {
      title,
      description,
      address,
      rentPerMonth,
      propertyType,
      bedrooms,
      bathrooms,
      amenities,
      availableFrom
    } = req.body;

    // Handle new image uploads
    let images = property.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/properties/${file.filename}`);
      images = [...images, ...newImages];
    }

    const updateData = {
      title: title || property.title,
      description: description || property.description,
      address: address ? JSON.parse(address) : property.address,
      rentPerMonth: rentPerMonth || property.rentPerMonth,
      propertyType: propertyType || property.propertyType,
      bedrooms: bedrooms || property.bedrooms,
      bathrooms: bathrooms || property.bathrooms,
      amenities: amenities ? JSON.parse(amenities) : property.amenities,
      availableFrom: availableFrom || property.availableFrom,
      images,
      isApproved: false // Require re-approval after update
    };

    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner of property only)
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Make sure user is property owner
    if (property.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property removed'
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get properties owned by logged in user
// @route   GET /api/properties/my-properties
// @access  Private (Owner only)
router.get('/owner/my-properties', protect, authorize('owner'), async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
