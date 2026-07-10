const Blog = require('../models/Blog');
const { uploadFile } = require('../utils/fileUpload');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
  try {
    const query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name avatar');
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    // Increment view count
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create blog article
// @route   POST /api/blogs
// @access  Private (Admin)
exports.createBlog = async (req, res) => {
  try {
    req.body.author = req.user.id;

    if (req.file) {
      const imageUrl = await uploadFile(req.file, 'blogs');
      req.body.image = imageUrl;
    }

    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((tag) => tag.trim());
    }

    const blog = await Blog.create(req.body);

    res.status(201).json({ success: true, message: 'Blog posted successfully!', blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog article
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    if (req.file) {
      const imageUrl = await uploadFile(req.file, 'blogs');
      req.body.image = imageUrl;
    }

    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((tag) => tag.trim());
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Blog updated successfully!', blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog article
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    await blog.deleteOne();
    res.status(200).json({ success: true, message: 'Blog article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
