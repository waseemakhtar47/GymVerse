import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trainerService } from '../services/trainerService';
import { gymService } from '../services/gymService';
import { chatService } from '../services/chatService';
import { blogService } from '../services/blogService';
import { courseService } from '../services/courseService';
import { 
  UserIcon, 
  VideoCameraIcon, 
  DocumentTextIcon, 
  StarIcon, 
  BriefcaseIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  HeartIcon,
  UserGroupIcon,
  BookOpenIcon,
  TrophyIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const TrainerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trainer, setTrainer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState([]);
  const [associatedGyms, setAssociatedGyms] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(false);
  const [selectedGym, setSelectedGym] = useState('');
  const [hiring, setHiring] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingLoading, setFollowingLoading] = useState(false);

  useEffect(() => {
    fetchTrainerData();
    fetchAssociatedGyms();
    if (user?.role === 'owner') {
      fetchGyms();
    }
    if (user?.role === 'user') {
      checkIfFollowing();
    }
  }, [id, user]);

  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      const [trainerRes, coursesRes, blogsRes] = await Promise.all([
        trainerService.getTrainerById(id),
        trainerService.getTrainerCourses(id),
        trainerService.getTrainerBlogs(id),
      ]);
      setTrainer(trainerRes.data.data);
      setCourses(coursesRes.data.data || []);
      setBlogs(blogsRes.data.data || []);
      setFollowersCount(trainerRes.data.data.followers || 0);
    } catch (error) {
      console.error('Failed to fetch trainer data:', error);
      toast.error('Trainer not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedGyms = async () => {
    setLoadingGyms(true);
    try {
      const res = await trainerService.getTrainerAssociatedGyms(id);
      setAssociatedGyms(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch associated gyms:', error);
    } finally {
      setLoadingGyms(false);
    }
  };

  const checkIfFollowing = async () => {
    try {
      const res = await trainerService.getFollowingTrainers();
      const followingTrainers = res.data.data || [];
      const isFollow = followingTrainers.some(t => t._id === id);
      setIsFollowing(isFollow);
    } catch (error) {
      console.error('Failed to check following status:', error);
    }
  };

  const fetchGyms = async () => {
    try {
      const res = await gymService.getOwnerGyms();
      setGyms(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
    }
  };

  const handleFollow = async () => {
    setFollowingLoading(true);
    try {
      const res = await trainerService.followTrainer(id);
      setIsFollowing(res.data.data.following);
      setFollowersCount(prev => res.data.data.following ? prev + 1 : prev - 1);
      toast.success(res.data.data.following ? 'Now following this trainer' : 'Unfollowed trainer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to follow trainer');
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const res = await chatService.getOrCreateChat(trainer._id);
      const chatId = res.data.data._id;
      navigate(`/${user?.role}/chat?chatId=${chatId}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleHire = async () => {
    if (!selectedGym) {
      toast.error('Please select a gym');
      return;
    }
    
    setHiring(true);
    try {
      await trainerService.applyToGym(selectedGym, trainer._id);
      toast.success(`Hiring request sent to ${trainer?.name}!`);
      setSelectedGym('');
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      toast.error(errorMsg || 'Failed to send hiring request');
    } finally {
      setHiring(false);
    }
  };

  const handleBlogClick = (blogId) => {
    navigate(`/user/blogs`);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course-player/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trainer profile...</p>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">Trainer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition flex items-center gap-2">
            ← Back
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-purple-900/50 to-blue-900/50 h-64"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="w-40 h-40 rounded-2xl bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden shadow-2xl">
              {trainer.profilePic ? (
                <img src={trainer.profilePic} alt={trainer.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-20 h-20 text-white" />
              )}
            </div>
            
            {/* Trainer Info */}
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white">{trainer.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm">
                      {trainer.specialty || 'Fitness Trainer'}
                    </span>
                    {trainer.experience && (
                      <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm flex items-center gap-1">
                        <TrophyIcon className="w-3 h-3" />
                        {trainer.experience}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Follow Button for Users */}
                {user?.role === 'user' && (
                  <button
                    onClick={handleFollow}
                    disabled={followingLoading}
                    className={`px-6 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                      isFollowing 
                        ? 'bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/30' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {followingLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isFollowing ? (
                      <>
                        <HeartSolidIcon className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <HeartIcon className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-semibold">{followersCount}</p>
                    <p className="text-gray-500 text-xs">Followers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VideoCameraIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-semibold">{courses.length}</p>
                    <p className="text-gray-500 text-xs">Courses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-semibold">{blogs.length}</p>
                    <p className="text-gray-500 text-xs">Blogs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-white font-semibold">4.9</p>
                    <p className="text-gray-500 text-xs">Rating</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{trainer.email}</span>
                </div>
                {trainer.phone && (
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{trainer.phone}</span>
                  </div>
                )}
                {trainer.address && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{trainer.address}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="md:text-right">
              {user?.role === 'user' && (
                <button
                  onClick={handleStartChat}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Message
                </button>
              )}
              
              {user?.role === 'owner' && (
                <div className="bg-white/10 rounded-xl p-4 min-w-64">
                  <label className="text-gray-400 text-sm block mb-2">Select Your Gym to Hire</label>
                  <select
                    value={selectedGym}
                    onChange={(e) => setSelectedGym(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                  >
                    <option value="">Select a gym...</option>
                    {gyms.map(gym => (
                      <option key={gym._id} value={gym._id}>{gym.name}</option>
                    ))}
                  </select>
                  {gyms.length === 0 && (
                    <p className="text-yellow-400 text-xs mb-2">
                      You don't have any gyms yet. 
                      <button onClick={() => navigate('/owner/create-gym')} className="text-purple-400 underline ml-1">Create one</button>
                    </p>
                  )}
                  <button
                    onClick={handleHire}
                    disabled={!selectedGym || hiring || gyms.length === 0}
                    className="w-full py-2 bg-purple-600 rounded-xl text-white hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <BriefcaseIcon className="w-4 h-4" />
                    {hiring ? 'Sending...' : 'Send Hiring Request'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bio & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-purple-400" />
                About Me
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {trainer.bio || "This trainer hasn't added a bio yet. Stay tuned for more information!"}
              </p>
              
              {/* Specialty & Experience Tags */}
              <div className="flex flex-wrap gap-3 mt-4">
                {trainer.specialty && (
                  <span className="px-3 py-1 bg-purple-500/10 rounded-full text-purple-400 text-sm flex items-center gap-1">
                    <CheckBadgeIcon className="w-3 h-3" />
                    {trainer.specialty}
                  </span>
                )}
                {trainer.experience && (
                  <span className="px-3 py-1 bg-blue-500/10 rounded-full text-blue-400 text-sm flex items-center gap-1">
                    <TrophyIcon className="w-3 h-3" />
                    {trainer.experience}
                  </span>
                )}
              </div>
            </div>

            {/* Courses Section - Clickable */}
            {courses.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <VideoCameraIcon className="w-5 h-5 text-purple-400" />
                  My Courses ({courses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <div
                      key={course._id}
                      onClick={() => handleCourseClick(course._id)}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-lg object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-purple-600 flex items-center justify-center">
                            <VideoCameraIcon className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold group-hover:text-purple-400 transition">
                            {course.title}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{course.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-purple-400 font-bold text-sm">₹{course.price}</span>
                            <span className="text-gray-500 text-xs">{course.enrolledUsers?.length || 0} students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blogs Section - Clickable */}
            {blogs.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-green-400" />
                  Recent Blogs ({blogs.length})
                </h2>
                <div className="space-y-3">
                  {blogs.slice(0, 5).map(blog => {
                    const likeCount = blog.likes?.length || blog.likeCount || 0;
                    const commentCount = blog.comments?.length || blog.commentCount || 0;
                    
                    return (
                      <div
                        key={blog._id}
                        onClick={() => handleBlogClick(blog._id)}
                        className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{blog.title}</h3>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                              {blog.excerpt || blog.content?.substring(0, 100)}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <HeartIcon className="w-3 h-3" />
                                {likeCount} likes
                              </span>
                              <span className="flex items-center gap-1">
                                <ChatBubbleLeftRightIcon className="w-3 h-3" />
                                {commentCount} comments
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(blog.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {blog.featuredImage && (
                            <img 
                              src={blog.featuredImage} 
                              alt={blog.title} 
                              className="w-16 h-16 rounded-lg object-cover ml-3" 
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {blogs.length > 5 && (
                  <button
                    onClick={() => navigate('/user/blogs')}
                    className="mt-4 text-purple-400 text-sm hover:text-purple-300 transition"
                  >
                    View all {blogs.length} blogs →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">{new Date(trainer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Students</span>
                  <span className="text-white">{courses.reduce((acc, c) => acc + (c.enrolledUsers?.length || 0), 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Blogs</span>
                  <span className="text-white">{blogs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Courses</span>
                  <span className="text-white">{courses.length}</span>
                </div>
              </div>
            </div>

            {/* ✅ Associated Gyms Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-purple-400" />
                Associated Gyms
              </h3>
              {loadingGyms ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 ml-2 text-sm">Loading gyms...</p>
                </div>
              ) : associatedGyms.length === 0 ? (
                <div className="text-center py-4">
                  <BuildingOfficeIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm">Not associated with any gym yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {associatedGyms.map((gym) => (
                    <div
                      key={gym._id}
                      onClick={() => navigate(`/gym-details/${gym._id}`)}
                      className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition group"
                    >
                      <div className="flex items-start gap-3">
                        <BuildingOfficeIcon className="w-8 h-8 text-purple-400" />
                        <div className="flex-1">
                          <p className="text-white font-semibold group-hover:text-purple-400 transition">
                            {gym.name}
                          </p>
                          {gym.address && (
                            <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                              <MapPinIcon className="w-3 h-3 inline mr-1" />
                              {gym.address}
                            </p>
                          )}
                          {gym.timings && (
                            <p className="text-gray-500 text-xs mt-1">
                              <ClockIcon className="w-3 h-3 inline mr-1" />
                              {gym.timings.open} - {gym.timings.close}
                            </p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            <CalendarIcon className="w-3 h-3 inline mr-1" />
                            Associated since: {new Date(gym.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;