const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');
const ContactMessage = require('../models/ContactMessage');
const Newsletter = require('../models/Newsletter');
const SystemSettings = require('../models/SystemSettings');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAgents = await User.countDocuments({ role: 'agent' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const totalProperties = await Property.countDocuments();
    const propertiesForSale = await Property.countDocuments({ purpose: 'sale' });
    const propertiesForRent = await Property.countDocuments({ purpose: 'rent' });

    const pendingListings = await Property.countDocuments({ approvalStatus: 'pending' });
    const approvedListings = await Property.countDocuments({ approvalStatus: 'approved' });
    const rejectedListings = await Property.countDocuments({ approvalStatus: 'rejected' });

    // Aggregate monthly revenue (mock computation for premium listings / subscription fees, or let's create a standard mock value)
    const revenue = approvedListings * 1500 + pendingListings * 300;

    // Fetch monthly stats for charts (mock or real mongo aggregations)
    // For simplicity, we return aggregated counts of properties by type
    const propertyTypeCounts = await Property.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } }
    ]);

    const recentProperties = await Property.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAgents,
        totalCustomers,
        totalProperties,
        propertiesForSale,
        propertiesForRent,
        pendingListings,
        approvedListings,
        rejectedListings,
        revenue,
        propertyTypeCounts,
        recentProperties,
        recentUsers,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend or Activate user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend an administrator account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'suspended'} successfully!`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject Property listings
// @route   PUT /api/admin/properties/:id/approve
// @access  Private (Admin)
exports.updateListingApproval = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status value' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    property.approvalStatus = status;
    if (status === 'approved') {
      property.isVerified = true;
    } else {
      property.isVerified = false;
    }

    await property.save();

    // Notify agent/owner
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: property.owner,
      type: 'approval',
      title: `Listing status: ${status}`,
      message: `Your property listing "${property.title}" has been ${status} by admin.`,
      link: '/agent/listings',
    });

    res.status(200).json({
      success: true,
      message: `Listing is now ${status}!`,
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get CMS global settings
// @route   GET /api/admin/settings
// @access  Public
exports.getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update CMS global settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
exports.updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      settings = await SystemSettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({ success: true, message: 'Settings updated successfully!', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all inquiries submitted via contact page
// @route   GET /api/admin/inquiries
// @access  Private (Admin)
exports.getContactInquiries = async (req, res) => {
  try {
    const inquiries = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Contact Us inquiry
// @route   POST /api/admin/inquiries
// @access  Public
exports.submitContactInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const inquiry = await ContactMessage.create({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! We will get back to you shortly.',
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Newsletter email
// @route   POST /api/admin/newsletter
// @access  Public
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    await Newsletter.create({ email });
    res.status(201).json({ success: true, message: 'Subscribed to our newsletter successfully!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already subscribed with this email' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all properties for approval admin management
// @route   GET /api/admin/properties
// @access  Private (Admin)
exports.getPropertiesForAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

