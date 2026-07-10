const Property = require('../models/Property');
const User = require('../models/User');
const { uploadFile } = require('../utils/fileUpload');

// @desc    Get all properties (with advanced filters, sorting, and geospatial search)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const query = { approvalStatus: 'approved' };

    // Purpose filter (rent, sale)
    if (req.query.purpose) {
      query.purpose = req.query.purpose;
    }

    // Property Type filter
    if (req.query.propertyType) {
      query.propertyType = req.query.propertyType;
    }

    // City, Area, Society matching
    if (req.query.city) {
      query.city = { $regex: req.query.city, $options: 'i' };
    }
    if (req.query.area) {
      query.area = { $regex: req.query.area, $options: 'i' };
    }
    if (req.query.society) {
      query.society = { $regex: req.query.society, $options: 'i' };
    }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { address: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Price range filters
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Bedrooms / Bathrooms
    if (req.query.bedrooms) {
      query.bedrooms = Number(req.query.bedrooms);
    }
    if (req.query.bathrooms) {
      query.bathrooms = Number(req.query.bathrooms);
    }

    // Amenities filters (swimmingPool, parking, garden, gym, internet, etc)
    const amenityKeys = ['parking', 'swimmingPool', 'garden', 'gym', 'electricityBackup', 'waterSupply', 'gas', 'internet', 'security'];
    amenityKeys.forEach((key) => {
      if (req.query[key] === 'true') {
        query[`amenities.${key}`] = true;
      }
    });

    // Geospatial Radius Search
    // coordinates format: ?lat=31.5204&lng=74.3587&radius=5 (radius in km, default 5)
    if (req.query.lat && req.query.lng) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radiusInKm = parseFloat(req.query.radius) || 5;

      const radiusInRadians = radiusInKm / 6378.1; // Divide distance by radius of Earth
      query.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians],
        },
      };
    }

    // Sorting definition
    let sortBy = { createdAt: -1 }; // default newest
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'oldest':
          sortBy = { createdAt: 1 };
          break;
        case 'lowestPrice':
          sortBy = { price: 1 };
          break;
        case 'highestPrice':
          sortBy = { price: -1 };
          break;
        case 'mostViewed':
          sortBy = { views: -1 };
          break;
        case 'featured':
          sortBy = { isFeatured: -1, createdAt: -1 };
          break;
        default:
          sortBy = { createdAt: -1 };
      }
    }

    const properties = await Property.find(query)
      .populate('owner', 'name email phone avatar')
      .sort(sortBy);

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone avatar');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment view count asynchronously
    property.views = (property.views || 0) + 1;
    await property.save();

    res.status(200).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
exports.createProperty = async (req, res) => {
  try {
    // Inject owner from token session
    req.body.owner = req.user.id;

    // Handle features parse if stringified JSON
    if (typeof req.body.amenities === 'string') {
      req.body.amenities = JSON.parse(req.body.amenities);
    }
    if (typeof req.body.nearbyPlaces === 'string') {
      req.body.nearbyPlaces = JSON.parse(req.body.nearbyPlaces);
    }

    // Location coordinates handling [lng, lat]
    if (req.body.lat && req.body.lng) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
      };
    }

    // File uploading handler
    const images = [];
    const videos = [];
    const documents = [];
    const floorPlans = [];

    if (req.files) {
      if (req.files.images) {
        for (const file of req.files.images) {
          const url = await uploadFile(file, 'properties/images');
          images.push(url);
        }
      }
      if (req.files.videos) {
        for (const file of req.files.videos) {
          const url = await uploadFile(file, 'properties/videos');
          videos.push(url);
        }
      }
      if (req.files.documents) {
        for (const file of req.files.documents) {
          const url = await uploadFile(file, 'properties/documents');
          documents.push(url);
        }
      }
      if (req.files.floorPlans) {
        for (const file of req.files.floorPlans) {
          const url = await uploadFile(file, 'properties/floorplans');
          floorPlans.push(url);
        }
      }
    }

    req.body.images = images.length > 0 ? images : req.body.images;
    req.body.videos = videos.length > 0 ? videos : req.body.videos;
    req.body.documents = documents.length > 0 ? documents : req.body.documents;
    req.body.floorPlans = floorPlans.length > 0 ? floorPlans : req.body.floorPlans;

    // Set defaults: Admin auto-approves, Agent requires verification
    if (req.user.role === 'admin') {
      req.body.approvalStatus = 'approved';
      req.body.isVerified = true;
    } else {
      req.body.approvalStatus = 'pending';
      req.body.isVerified = false;
    }

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin' ? 'Listing created and approved!' : 'Listing submitted! Pending admin approval.',
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Verify ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this property' });
    }

    if (typeof req.body.amenities === 'string') {
      req.body.amenities = JSON.parse(req.body.amenities);
    }
    if (typeof req.body.nearbyPlaces === 'string') {
      req.body.nearbyPlaces = JSON.parse(req.body.nearbyPlaces);
    }

    if (req.body.lat && req.body.lng) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
      };
    }

    // Upload any new files and append/overwrite
    if (req.files) {
      const { images, videos, documents, floorPlans } = property;
      
      if (req.files.images) {
        for (const file of req.files.images) {
          images.push(await uploadFile(file, 'properties/images'));
        }
        req.body.images = images;
      }
      if (req.files.videos) {
        for (const file of req.files.videos) {
          videos.push(await uploadFile(file, 'properties/videos'));
        }
        req.body.videos = videos;
      }
      if (req.files.documents) {
        for (const file of req.files.documents) {
          documents.push(await uploadFile(file, 'properties/documents'));
        }
        req.body.documents = documents;
      }
      if (req.files.floorPlans) {
        for (const file of req.files.floorPlans) {
          floorPlans.push(await uploadFile(file, 'properties/floorplans'));
        }
        req.body.floorPlans = floorPlans;
      }
    }

    // Reset approval status to pending if updated by agent (admin stays approved)
    if (req.user.role !== 'admin') {
      req.body.approvalStatus = 'pending';
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully!',
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Verify ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this property' });
    }

    await property.deleteOne();

    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle favorite status on a property
// @route   POST /api/properties/:id/favorite
// @access  Private (Customer)
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isFav = user.favorites.includes(propertyId);

    if (isFav) {
      user.favorites = user.favorites.filter((id) => id.toString() !== propertyId);
      await user.save();
      res.status(200).json({ success: true, message: 'Removed from favorites', favorites: user.favorites });
    } else {
      user.favorites.push(propertyId);
      await user.save();
      res.status(200).json({ success: true, message: 'Added to favorites', favorites: user.favorites });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in agent's own properties
// @route   GET /api/properties/my-listings
// @access  Private (Agent/Admin)
exports.getMyListings = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: properties.length, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
