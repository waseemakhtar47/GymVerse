import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { courseService } from '../../services/courseService';
import { uploadService } from '../../services/uploadService';
import { VideoCameraIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [removingVideo, setRemovingVideo] = useState(false);
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
      setFormData({ ...formData, videoFile: res.data.data.url, videoUrl: '' });
      toast.success('Video uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (!confirm('Are you sure you want to remove the uploaded video? The course will use video URL if available.')) {
      return;
    }
    
    setRemovingVideo(true);
    try {
      await courseService.updateCourse(id, { ...formData, videoFile: '' });
      setFormData({ ...formData, videoFile: '' });
      toast.success('Video removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove video');
    } finally {
      setRemovingVideo(false);
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

  const handleRemoveThumbnail = async () => {
    if (!confirm('Are you sure you want to remove the thumbnail?')) {
      return;
    }
    
    try {
      await courseService.updateCourse(id, { ...formData, thumbnail: '' });
      setFormData({ ...formData, thumbnail: '' });
      setThumbnailPreview(null);
      toast.success('Thumbnail removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove thumbnail');
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
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
              >
                <option value="beginner" className="bg-gray-800 text-white">Beginner</option>
                <option value="intermediate" className="bg-gray-800 text-white">Intermediate</option>
                <option value="advanced" className="bg-gray-800 text-white">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
              >
                <option value="fitness" className="bg-gray-800 text-white">Fitness</option>
                <option value="yoga" className="bg-gray-800 text-white">Yoga</option>
                <option value="nutrition" className="bg-gray-800 text-white">Nutrition</option>
                <option value="strength" className="bg-gray-800 text-white">Strength Training</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-white mb-2">Validity Period</label>
            <select
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value={30} className="bg-gray-800 text-white">30 days (1 month)</option>
              <option value={90} className="bg-gray-800 text-white">90 days (3 months)</option>
              <option value={180} className="bg-gray-800 text-white">180 days (6 months)</option>
              <option value={365} className="bg-gray-800 text-white">365 days (1 year)</option>
              <option value={730} className="bg-gray-800 text-white">730 days (2 years)</option>
            </select>
          </div>
          
          {/* Thumbnail Upload with Remove Option */}
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
              <div className="flex gap-2 justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <span className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition">
                    {uploadingThumbnail ? 'Uploading...' : (thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail')}
                  </span>
                </label>
                {thumbnailPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="px-4 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-2">JPG, PNG, GIF (Max 5MB)</p>
            </div>
          </div>
          
          {/* Video Upload with Remove Option */}
          <div>
            <label className="block text-white mb-2">Course Video</label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-purple-500 transition">
              <VideoCameraIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <div className="flex gap-2 justify-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <span className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition">
                    {uploadingVideo ? 'Uploading...' : 'Upload New Video'}
                  </span>
                </label>
                {formData.videoFile && (
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    disabled={removingVideo}
                    className="px-4 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    {removingVideo ? 'Removing...' : 'Remove Video'}
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-2">MP4, MOV, AVI (Max 100MB)</p>
            </div>
            {formData.videoFile && (
              <p className="text-green-400 text-sm mt-2">✓ Video file uploaded</p>
            )}
            {formData.videoUrl && !formData.videoFile && (
              <p className="text-blue-400 text-sm mt-2">✓ Video URL configured (will be used if no video file)</p>
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
            <p className="text-gray-500 text-xs mt-1">
              {formData.videoFile ? 'Video file will be used as priority. URL will be used only if no video file.' : 'URL will be used as video source'}
            </p>
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