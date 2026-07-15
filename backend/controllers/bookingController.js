const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Create a new site visit booking request
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
  try {
    const { propertyId, visitDate, visitTime, customerMessage } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const booking = await Booking.create({
      property: propertyId,
      customer: req.user.id,
      agent: property.owner,
      visitDate,
      visitTime,
      customerMessage,
      timeline: [
        {
          status: 'pending',
          comment: 'Visit requested by customer.',
        }
      ]
    });

    // Send in-app notification to the agent/owner
    await Notification.create({
      recipient: property.owner,
      sender: req.user.id,
      type: 'booking',
      title: 'New Visit Request',
      message: `A customer has requested to visit your property: "${property.title}".`,
      link: `/agent/bookings`,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title address price images purpose')
      .populate('customer', 'name email phone avatar')
      .populate('agent', 'name email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query = { customer: req.user.id };
    } else if (req.user.role === 'agent') {
      query = { agent: req.user.id };
    } // Admin gets all

    const bookings = await Booking.find(query)
      .populate('property', 'title address price images purpose')
      .populate('customer', 'name email phone avatar')
      .populate('agent', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (Approve, Reject, Reschedule)
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, agentResponse, visitDate, visitTime } = req.body;
    const booking = await Booking.findById(req.params.id).populate('property', 'title');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized party: either Customer (cancel/reschedule) or Agent/Admin (approve/reject/reschedule)
    const isCustomer = booking.customer.toString() === req.user.id;
    const isAgentOrAdmin = booking.agent.toString() === req.user.id || req.user.role === 'admin';

    if (!isCustomer && !isAgentOrAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this booking' });
    }

    if (status) {
      booking.status = status;
    }
    if (agentResponse) {
      booking.agentResponse = agentResponse;
    }
    if (visitDate) {
      booking.visitDate = visitDate;
    }
    if (visitTime) {
      booking.visitTime = visitTime;
    }

    const commentText = status
      ? `Status changed to ${status}. ${agentResponse || ''}`
      : `Visit details updated/rescheduled.`;

    booking.timeline.push({
      status: booking.status,
      comment: commentText,
    });

    await booking.save();

    // Create notifications for the relevant users
    const recipient = isCustomer ? booking.agent : booking.customer;
    await Notification.create({
      recipient,
      sender: req.user.id,
      type: 'booking',
      title: `Booking Update: ${booking.status}`,
      message: `Your booking for "${booking.property.title}" has been updated. Status: ${booking.status}.`,
      link: req.user.role === 'customer' ? `/agent/bookings` : `/customer/bookings`,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title address price images purpose')
      .populate('customer', 'name email phone avatar')
      .populate('agent', 'name email phone avatar');

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
