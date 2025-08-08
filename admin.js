const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;

    let query = {};
    if (role) query.role = role;
    if (status !== undefined) query.isActive = status === 'active';

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        total
      },
      data: users
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
router.get('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow admin to delete themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all properties (including unapproved)
// @route   GET /api/admin/properties
// @access  Private (Admin only)
router.get('/properties', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, approved } = req.query;

    let query = {};
    if (status !== undefined) query.isActive = status === 'active';
    if (approved !== undefined) query.isApproved = approved === 'true';

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const properties = await Property.find(query)
      .populate('owner', 'name email')
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

// @desc    Update property approval status
// @route   PUT /api/admin/properties/:id/approval
// @access  Private (Admin only)
router.put('/properties/:id/approval', protect, authorize('admin'), async (req, res) => {
  try {
    const { isApproved } = req.body;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

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

// @desc    Delete property
// @route   DELETE /api/admin/properties/:id
// @access  Private (Admin only)
router.delete('/properties/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get property statistics
    const propertyStats = await Property.aggregate([
      {
        $group: {
          _id: {
            isActive: '$isActive',
            isApproved: '$isApproved'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format user statistics
    const formattedUserStats = {
      admin: 0,
      owner: 0,
      renter: 0,
      total: 0
    };

    userStats.forEach(stat => {
      formattedUserStats[stat._id] = stat.count;
      formattedUserStats.total += stat.count;
    });

    // Format property statistics
    const formattedPropertyStats = {
      active: 0,
      inactive: 0,
      approved: 0,
      pending: 0,
      total: 0
    };

    propertyStats.forEach(stat => {
      if (stat._id.isActive) formattedPropertyStats.active += stat.count;
      else formattedPropertyStats.inactive += stat.count;
      
      if (stat._id.isApproved) formattedPropertyStats.approved += stat.count;
      else formattedPropertyStats.pending += stat.count;
      
      formattedPropertyStats.total += stat.count;
    });

    // Format booking statistics
    const formattedBookingStats = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      cancelled: 0,
      total: 0
    };

    bookingStats.forEach(stat => {
      formattedBookingStats[stat._id] = stat.count;
      formattedBookingStats.total += stat.count;
    });

    res.json({
      success: true,
      data: {
        users: formattedUserStats,
        properties: formattedPropertyStats,
        bookings: formattedBookingStats
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
router.get('/bookings', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status) query.status = status;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const bookings = await Booking.find(query)
      .populate('property', 'title address')
      .populate('renter', 'name email')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        total
      },
      data: bookings
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
