const Blog = require('../models/Blog');
const User = require('../models/User');

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private (Trainer only)
const createBlog = async (req, res) => {
  try {
    // Only trainers can create blogs
    if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers can create blogs',
      });
    }

    const { title, content, excerpt, category, tags, featuredImage } = req.body;

    const blog = await Blog.create({
      authorId: req.user.id,
      title,
      content,
      excerpt: excerpt || content.substring(0, 200),
      category,
      tags: tags || [],
      featuredImage: featuredImage || '',
    });

    res.status(201).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all blogs (public)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10, search } = req.query;
    
    let query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const blogs = await Blog.find(query)
      .populate('authorId', 'name profilePic role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('authorId', 'name profilePic role');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Author only)
const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    // Check if user is the author
    if (blog.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }
    
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Author only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    if (blog.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }
    
    await blog.deleteOne();
    
    res.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Like/Unlike a blog
// @route   POST /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    const alreadyLiked = blog.likes.find(
      like => like.userId.toString() === req.user.id
    );
    
    if (alreadyLiked) {
      // Unlike
      blog.likes = blog.likes.filter(
        like => like.userId.toString() !== req.user.id
      );
    } else {
      // Like
      blog.likes.push({ userId: req.user.id });
    }
    
    await blog.save();
    
    res.json({
      success: true,
      data: {
        liked: !alreadyLiked,
        likeCount: blog.likes.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required',
      });
    }
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    blog.comments.push({
      userId: req.user.id,
      comment,
    });
    
    await blog.save();
    
    // Populate user info for the new comment
    const populatedBlog = await Blog.findById(req.params.id)
      .populate('comments.userId', 'name profilePic');
    
    const newComment = populatedBlog.comments[populatedBlog.comments.length - 1];
    
    res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/blogs/:blogId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }
    
    const comment = blog.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }
    
    // Check if user is comment author or blog author or admin
    if (
      comment.userId.toString() !== req.user.id &&
      blog.authorId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }
    
    comment.deleteOne();
    await blog.save();
    
    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get blogs by author (trainer)
// @route   GET /api/blogs/author/:authorId
// @access  Public
const getBlogsByAuthor = async (req, res) => {
  try {
    const blogs = await Blog.find({
      authorId: req.params.authorId,
      isPublished: true,
    })
      .populate('authorId', 'name profilePic')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get trainer's own blogs (for dashboard)
// @route   GET /api/blogs/my-blogs
// @access  Private (Trainer only)
const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.user.id })
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  deleteComment,
  getBlogsByAuthor,
  getMyBlogs,
};