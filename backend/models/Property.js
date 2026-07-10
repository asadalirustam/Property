const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter a description'],
    },
    purpose: {
      type: String,
      enum: ['rent', 'sale'],
      required: [true, 'Please specify purpose: rent or sale'],
    },
    propertyType: {
      type: String,
      enum: [
        'House',
        'Apartment',
        'Villa',
        'Flat',
        'Commercial Building',
        'Office',
        'Shop',
        'Plot',
        'Farm House'
      ],
      required: [true, 'Please select a property type'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter the price'],
    },
    country: {
      type: String,
      required: [true, 'Please enter country'],
      default: 'Pakistan',
    },
    province: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'Please enter city'],
    },
    area: {
      type: String,
      required: [true, 'Please enter area/neighborhood'],
    },
    society: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Please enter full address'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: [true, 'Please specify location coordinates [lng, lat]'],
      },
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    kitchens: {
      type: Number,
      default: 0,
    },
    garage: {
      type: Number,
      default: 0,
    },
    areaSize: {
      type: String, // e.g. "250 Sq. Yd.", "5 Marla", "1200 Sq. Ft."
      required: [true, 'Please specify area size'],
    },
    yearBuilt: {
      type: Number,
      default: new Date().getFullYear(),
    },
    // Amenities checklist
    amenities: {
      parking: { type: Boolean, default: false },
      swimmingPool: { type: Boolean, default: false },
      garden: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      electricityBackup: { type: Boolean, default: false },
      waterSupply: { type: Boolean, default: false },
      gas: { type: Boolean, default: false },
      internet: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
    },
    nearbyPlaces: {
      schools: { type: String, default: '' },
      hospitals: { type: String, default: '' },
      mosques: { type: String, default: '' },
      markets: { type: String, default: '' },
      parks: { type: String, default: '' },
      roads: { type: String, default: '' },
    },
    images: [{ type: String }],
    videos: [{ type: String }],
    documents: [{ type: String }],
    floorPlans: [{ type: String }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented'],
      default: 'available',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// GeoJSON index definition
propertySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
