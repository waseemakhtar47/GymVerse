import { useState, useEffect } from 'react';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';
import DashboardLayout from '../components/DashboardLayout';

const BlogFeed = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const categories = ['all', 'workout', 'nutrition', 'motivation', 'recovery', 'general'];

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      
      const res = await blogService.getAllBlogs(params);
      setBlogs(res.data.data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [category, search]);

  return (
    <DashboardLayout title="Fitness Blogs" role="user">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                category === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Search blogs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      {/* Blog Grid */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-400 py-10">No blogs found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} onRefresh={fetchBlogs} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default BlogFeed;