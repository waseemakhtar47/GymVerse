import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogService } from '../services/blogService';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await blogService.createBlog(formData);
      toast.success('Blog created successfully!');
      navigate('/trainer/blogs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <DashboardLayout title="Create New Blog" role="trainer">
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="workout" className="bg-gray-800 text-white">Workout</option>
              <option value="nutrition" className="bg-gray-800 text-white">Nutrition</option>
              <option value="motivation" className="bg-gray-800 text-white">Motivation</option>
              <option value="recovery" className="bg-gray-800 text-white">Recovery</option>
              <option value="general" className="bg-gray-800 text-white">General</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags..."
                className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-purple-600 rounded-lg">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm flex items-center gap-1">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-white mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Blog'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateBlog;