const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter email'],
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'Please enter subject'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please enter message'],
    },
    isReplied: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
