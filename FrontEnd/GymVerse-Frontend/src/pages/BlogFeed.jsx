import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/blogService';
import BlogCard from '../components/BlogCard';
import DashboardLayout from '../components/DashboardLayout';
import { MagnifyingGlassIcon, XMarkIcon, UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const BlogFeed = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [refresh, setRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'following'

  const categories = ['all', 'workout', 'nutrition', 'motivation', 'recovery', 'general'];

  useEffect(() => {
    fetchBlogs();
  }, [category, refresh, activeTab, user]);

  // Search filter effect
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.authorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBlogs(filtered);
    }
  }, [searchTerm, blogs]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let res;
      
      // If user is trainer, fetch only their blogs
      if (user?.role === 'trainer') {
        res = await blogService.getMyBlogs();
      } 
      // If user and active tab is 'following', fetch blogs from followed trainers
      else if (user?.role === 'user' && activeTab === 'following') {
        res = await blogService.getFollowingBlogs();
      }
      // For users on 'all' tab
      else {
        const params = {};
        if (category !== 'all') params.category = category;
        res = await blogService.getAllBlogs(params);
      }
      
      setBlogs(res.data.data || []);
      setFilteredBlogs(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const getTitle = () => {
    if (user?.role === 'trainer') return 'My Blogs';
    if (activeTab === 'following') return 'Blogs from Trainers You Follow';
    return 'Fitness Blogs';
  };

  if (loading) {
    return (
      <DashboardLayout title={getTitle()} role={user?.role || 'user'}>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading blogs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={getTitle()} role={user?.role || 'user'}>
      <div className="space-y-6">
        {/* Tabs for Users */}
        {user?.role === 'user' && (
          <div className="flex gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <GlobeAltIcon className="w-4 h-4" />
              All Blogs
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                activeTab === 'following' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserGroupIcon className="w-4 h-4" />
              Following
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search blogs by title, content, author, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <p className="text-gray-400 text-sm">
            Found {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </p>
        )}

        {/* Category Filters - Only for users on 'all' tab and not trainers */}
        {user?.role !== 'trainer' && activeTab === 'all' && (
          <div className="flex flex-wrap gap-2">
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
        )}

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            {searchTerm ? (
              <>
                <p className="text-gray-400">No blogs found matching "{searchTerm}"</p>
                <button
                  onClick={handleClearSearch}
                  className="mt-4 text-purple-400 hover:text-purple-300"
                >
                  Clear search
                </button>
              </>
            ) : user?.role === 'trainer' ? (
              <>
                <p className="text-gray-400">You haven't created any blogs yet.</p>
                <button
                  onClick={() => window.location.href = '/trainer/create-blog'}
                  className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                >
                  Create Your First Blog
                </button>
              </>
            ) : activeTab === 'following' ? (
              <>
                <UserGroupIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">No blogs from trainers you follow.</p>
                <p className="text-gray-500 text-sm mt-2">Follow some trainers to see their blogs here!</p>
                <button
                  onClick={() => window.location.href = '/user/trainers'}
                  className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                >
                  Find Trainers to Follow
                </button>
              </>
            ) : (
              <p className="text-gray-400">No blogs available in this category</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} onRefresh={handleRefresh} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BlogFeed;