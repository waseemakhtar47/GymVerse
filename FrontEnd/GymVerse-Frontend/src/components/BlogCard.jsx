import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/blogService';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const BlogCard = ({ blog, onRefresh }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(blog.likes?.some(l => l.userId === user?._id));
  const [likeCount, setLikeCount] = useState(blog.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = async () => {
    try {
      const res = await blogService.likeBlog(blog._id);
      setLiked(res.data.data.liked);
      setLikeCount(res.data.data.likeCount);
    } catch (error) {
      toast.error('Failed to like blog');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await blogService.addComment(blog._id, comment);
      setComment('');
      onRefresh();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-[1.02] transition">
      {blog.featuredImage && (
        <img src={blog.featuredImage} alt={blog.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
            {blog.category}
          </span>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{blog.commentCount || blog.comments?.length || 0}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{blog.title}</h3>
        <p className="text-gray-300 text-sm mb-4">{blog.excerpt || blog.content?.substring(0, 150)}...</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm">{blog.authorId?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{blog.authorId?.name}</p>
              <p className="text-gray-400 text-xs">{new Date(blog.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <button onClick={handleLike} className="flex items-center gap-1">
            {liked ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
            )}
            <span className="text-gray-400 text-sm">{likeCount}</span>
          </button>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="space-y-3 max-h-40 overflow-y-auto mb-3">
              {blog.comments?.map((c, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-2">
                  <p className="text-white text-sm">
                    <span className="font-semibold">{c.userId?.name}:</span> {c.comment}
                  </p>
                  <p className="text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            {user && (
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button type="submit" className="px-3 py-2 bg-purple-600 rounded-lg text-white text-sm">
                  Post
                </button>
              </form>
            )}
          </div>
        )}
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="mt-3 text-sm text-purple-400 hover:text-purple-300"
        >
          {showComments ? 'Hide comments' : `View comments (${blog.comments?.length || 0})`}
        </button>
      </div>
    </div>
  );
};

export default BlogCard;