const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new booking request
// @route   POST /api/bookings
// @access  Private (Renter only)
router.post('/', protect, authorize('renter'), [
  body('property', 'Property ID is required').not().isEmpty(),
  body('moveInDate', 'Move-in date is required').isISO8601(),
  body('duration', 'Duration in months is required').isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { property, moveInDate, duration, message } = req.body;

    // Check if property exists and is available
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (!propertyDoc.isActive || !propertyDoc.isApproved) {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    // Check if the requested move-in date is after the property's available date
    if (new Date(moveInDate) < propertyDoc.availableFrom) {
      return res.status(400).json({ 
        message: 'Move-in date cannot be before the property\'s availability date' 
      });
    }

    // Calculate total amount
    const totalAmount = propertyDoc.rentPerMonth * duration;

    const booking = new Booking({
      property,
      renter: req.user.id,
      owner: propertyDoc.owner,
      moveInDate,
      duration,
      totalAmount,
      message
    });

    await booking.save();

    // Populate the booking with property and user details
    await booking.populate([
      { path: 'property', select: 'title address rentPerMonth' },
      { path: 'renter', select: 'name email phone' },
      { path: 'owner', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get bookings for logged in user (renter gets their requests, owner gets requests for their properties)
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'renter') {
      query.renter = req.user.id;
    } else if (req.user.role === 'owner') {
      query.owner = req.user.id;
    }

    const bookings = await Booking.find(query)
      .populate('property', 'title address rentPerMonth images')
      .populate('renter', 'name email phone')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title address rentPerMonth images')
      .populate('renter', 'name email phone')
      .populate('owner', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure user is either the renter or the owner
    if (booking.renter._id.toString() !== req.user.id && 
        booking.owner._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update booking status (approve/reject)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner only)
router.put('/:id/status', protect, authorize('owner'), [
  body('status', 'Status must be confirmed or rejected').isIn(['confirmed', 'rejected'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status, ownerResponse } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure user is the property owner
    if (booking.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Can only update pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking status can only be updated for pending requests' });
    }

    booking.status = status;
    booking.ownerResponse = ownerResponse;
    await booking.save();

    await booking.populate([
      { path: 'property', select: 'title address rentPerMonth' },
      { path: 'renter', select: 'name email phone' },
      { path: 'owner', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Renter only - can only cancel their own pending bookings)
router.put('/:id/cancel', protect, authorize('renter'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure user is the renter
    if (booking.renter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Can only cancel pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await booking.populate([
      { path: 'property', select: 'title address rentPerMonth' },
      { path: 'renter', select: 'name email phone' },
      { path: 'owner', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get booking statistics for owner
// @route   GET /api/bookings/stats
// @access  Private (Owner only)
router.get('/owner/stats', protect, authorize('owner'), async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $match: { owner: req.user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
