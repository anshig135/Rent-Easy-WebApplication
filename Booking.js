const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  renter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Renter is required']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  moveInDate: {
    type: Date,
    required: [true, 'Move-in date is required']
  },
  duration: {
    type: Number, // Duration in months
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 month']
  },
  moveOutDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  ownerResponse: {
    type: String,
    maxlength: [500, 'Response cannot be more than 500 characters']
  },
  respondedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate move-out date before saving
BookingSchema.pre('save', function(next) {
  if (this.moveInDate && this.duration) {
    const moveOutDate = new Date(this.moveInDate);
    moveOutDate.setMonth(moveOutDate.getMonth() + this.duration);
    this.moveOutDate = moveOutDate;
  }
  next();
});

// Set responded date when status is updated
BookingSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.respondedAt = Date.now();
  }
  next();
});

// Index for efficient queries
BookingSchema.index({ property: 1, status: 1 });
BookingSchema.index({ renter: 1, status: 1 });
BookingSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
