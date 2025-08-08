const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  rentPerMonth: {
    type: Number,
    required: [true, 'Please add rent per month'],
    min: [0, 'Rent cannot be negative']
  },
  propertyType: {
    type: String,
    required: [true, 'Please select property type'],
    enum: ['apartment', 'house', 'condo', 'townhouse', 'studio']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please add number of bedrooms'],
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please add number of bathrooms'],
    min: [0, 'Bathrooms cannot be negative']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String // URLs to image files
  }],
  availableFrom: {
    type: Date,
    required: [true, 'Please add availability date']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false // Admin approval required
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PropertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create index for location-based searches
PropertySchema.index({ 'address.city': 1, 'address.state': 1 });
PropertySchema.index({ rentPerMonth: 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ bedrooms: 1, bathrooms: 1 });

module.exports = mongoose.model('Property', PropertySchema);
