import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { courseService } from '../../services/courseService';
import { uploadService } from '../../services/uploadService';
import { VideoCameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '',
    level: 'beginner',
    category: 'fitness',
    videoUrl: '',
    videoFile: '',
    thumbnail: '',
    validityDays: 365,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setFetching(true);
    try {
      const res = await courseService.getCourseById(id);
      const course = res.data.data;
      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || 0,
        duration: course.duration || '',
        level: course.level || 'beginner',
        category: course.category || 'fitness',
        videoUrl: course.videoUrl || '',
        videoFile: course.videoFile || '',
        thumbnail: course.thumbnail || '',
        validityDays: course.validityDays || 365,
      });
      if (course.thumbnail) {
        setThumbnailPreview(course.thumbnail);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('Failed to load course');
      navigate('/trainer/courses');
    } finally {
      setFetching(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size should be less than 100MB');
      return;
    }
    
    setUploadingVideo(true);
    const formDataFile = new FormData();
    formDataFile.append('video', file);
    
    try {
      const res = await uploadService.uploadVideo(formDataFile);
      setFormData({ ...formData, videoFile: res.data.data.url });
      toast.success('Video uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Thumbnail size should be less than 5MB');
      return;
    }
    
    setUploadingThumbnail(true);
    const formDataFile = new FormData();
    formDataFile.append('thumbnail', file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    try {
      const res = await uploadService.uploadThumbnail(formDataFile);
      setFormData({ ...formData, thumbnail: res.data.data.url });
      toast.success('Thumbnail uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await courseService.updateCourse(id, formData);
      toast.success('Course updated successfully!');
      navigate('/trainer/courses');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout title="Edit Course" role="trainer">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Course" role="trainer">
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Course Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="fitness">Fitness</option>
                <option value="yoga">Yoga</option>
                <option value="nutrition">Nutrition</option>
                <option value="strength">Strength Training</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-white mb-2">Validity Period</label>
            <select
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={30}>30 days (1 month)</option>
              <option value={90}>90 days (3 months)</option>
              <option value={180}>180 days (6 months)</option>
              <option value={365}>365 days (1 year)</option>
              <option value={730}>730 days (2 years)</option>
            </select>
          </div>
          
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-white mb-2">Course Thumbnail</label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-purple-500 transition">
              {thumbnailPreview ? (
                <div className="mb-3">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                </div>
              ) : (
                <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                id="thumbnail-upload"
              />
              <label htmlFor="thumbnail-upload" className="cursor-pointer inline-block">
                <span className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition">
                  {uploadingThumbnail ? 'Uploading...' : (thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail')}
                </span>
              </label>
              <p className="text-gray-500 text-xs mt-2">JPG, PNG, GIF (Max 5MB)</p>
            </div>
          </div>
          
          {/* Video Upload */}
          <div>
            <label className="block text-white mb-2">Course Video</label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-purple-500 transition">
              <VideoCameraIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer inline-block">
                <span className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition">
                  {uploadingVideo ? 'Uploading...' : 'Upload New Video'}
                </span>
              </label>
              <p className="text-gray-500 text-xs mt-2">MP4, MOV, AVI (Max 100MB)</p>
            </div>
            {formData.videoFile && (
              <p className="text-green-400 text-sm mt-2">✓ Video file present</p>
            )}
          </div>
          
          {/* Video URL */}
          <div>
            <label className="block text-white mb-2">Or Video URL (YouTube/Vimeo)</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || uploadingVideo || uploadingThumbnail}
            className="w-full py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditCourse;