const Blog = require('../models/Blog');
const User = require('../models/User');

// Helper function to add counts
const addCountsToBlogs = (blogs) => {
  return blogs.map(blog => ({
    ...blog.toObject(),
    likeCount: blog.likes?.length || 0,
    commentCount: blog.comments?.length || 0,
  }));
};

// @desc    Create a new blog
const createBlog = async (req, res) => {
  try {
    if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only trainers can create blogs' });
    }

    const { title, content, excerpt, category, tags, featuredImage } = req.body;

    const blog = await Blog.create({
      authorId: req.user._id,
      title,
      content,
      excerpt: excerpt || content?.substring(0, 200) || '',
      category: category || 'general',
      tags: tags || [],
      featuredImage: featuredImage || '',
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('createBlog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all blogs
const getBlogs = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    
    let query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    
    const blogs = await Blog.find(query)
      .populate('authorId', 'name profilePic role')
      .populate('comments.userId', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments(query);
    const blogsWithCounts = addCountsToBlogs(blogs);
    
    res.json({
      success: true,
      data: blogsWithCounts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('getBlogs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('authorId', 'name profilePic role')
      .populate('comments.userId', 'name profilePic');
    
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    
    blog.views += 1;
    await blog.save();
    
    const blogWithCounts = {
      ...blog.toObject(),
      likeCount: blog.likes?.length || 0,
      commentCount: blog.comments?.length || 0,
    };
    
    res.json({ success: true, data: blogWithCounts });
  } catch (error) {
    console.error('getBlogById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog
const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    
    if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('updateBlog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    
    if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await blog.deleteOne();
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('deleteBlog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like/Unlike a blog
const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    
    const alreadyLiked = blog.likes?.some(like => like.userId.toString() === req.user._id.toString());
    
    if (alreadyLiked) {
      blog.likes = blog.likes.filter(like => like.userId.toString() !== req.user._id.toString());
    } else {
      blog.likes.push({ userId: req.user._id });
    }
    
    await blog.save();
    
    res.json({
      success: true,
      data: { liked: !alreadyLiked, likeCount: blog.likes.length },
    });
  } catch (error) {
    console.error('likeBlog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to blog
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ success: false, message: 'Comment is required' });
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    
    blog.comments.push({ userId: req.user._id, comment });
    await blog.save();
    
    const newComment = blog.comments[blog.comments.length - 1];
    
    res.status(201).json({
      success: true,
      data: {
        _id: newComment._id,
        comment: newComment.comment,
        userId: { _id: req.user._id, name: req.user.name, profilePic: req.user.profilePic || '' },
        createdAt: newComment.createdAt,
      },
    });
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment
const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    
    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    if (comment.userId.toString() !== req.user._id.toString() &&
        blog.authorId.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    comment.deleteOne();
    await blog.save();
    
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('deleteComment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blogs by author
const getBlogsByAuthor = async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.params.authorId, isPublished: true })
      .populate('authorId', 'name profilePic')
      .sort({ createdAt: -1 });
    
    const blogsWithCounts = blogs.map(blog => ({
      ...blog.toObject(),
      likeCount: blog.likes?.length || 0,
      commentCount: blog.comments?.length || 0,
    }));
    
    res.json({ success: true, data: blogsWithCounts });
  } catch (error) {
    console.error('getBlogsByAuthor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's own blogs
const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.user._id })
      .populate('authorId', 'name profilePic role')
      .populate('comments.userId', 'name profilePic')
      .sort({ createdAt: -1 });
    
    const blogsWithCounts = addCountsToBlogs(blogs);
    res.json({ success: true, data: blogsWithCounts });
  } catch (error) {
    console.error('getMyBlogs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blogs from trainers the user follows
const getFollowingBlogs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('following');
    
    if (!user || !user.following || user.following.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const blogs = await Blog.find({
      authorId: { $in: user.following },
      isPublished: true,
    })
      .populate('authorId', 'name profilePic role')
      .populate('comments.userId', 'name profilePic')
      .sort({ createdAt: -1 });
    
    const blogsWithCounts = addCountsToBlogs(blogs);
    res.json({ success: true, data: blogsWithCounts });
  } catch (error) {
    console.error('getFollowingBlogs error:', error);
    res.status(500).json({ success: false, message: error.message });
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
  getFollowingBlogs,
};