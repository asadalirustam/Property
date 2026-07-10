const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Please enter a visit date'],
    },
    visitTime: {
      type: String,
      required: [true, 'Please specify a slot time'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    customerMessage: {
      type: String,
      trim: true,
      default: '',
    },
    agentResponse: {
      type: String,
      trim: true,
      default: '',
    },
    timeline: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        comment: String,
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
