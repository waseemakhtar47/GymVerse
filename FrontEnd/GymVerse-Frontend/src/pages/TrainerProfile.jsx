import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trainerService } from '../services/trainerService';
import { gymService } from '../services/gymService';
import { chatService } from '../services/chatService';
import { 
  UserIcon, 
  VideoCameraIcon, 
  DocumentTextIcon, 
  StarIcon, 
  BriefcaseIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
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
  const [selectedGym, setSelectedGym] = useState('');
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    fetchTrainerData();
    if (user?.role === 'owner') {
      fetchGyms();
    }
  }, [id]);

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
    } catch (error) {
      console.error('Failed to fetch trainer data:', error);
      toast.error('Trainer not found');
      navigate(-1);
    } finally {
      setLoading(false);
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
      if (errorMsg === 'Hiring request already sent to this trainer. Waiting for response.') {
        toast.error('Hiring request already sent. Waiting for trainer response.');
      } else if (errorMsg === 'Trainer has already rejected your request. Cannot send again.') {
        toast.error('Trainer has already rejected your request.');
      } else if (errorMsg === 'Trainer is already associated with this gym') {
        toast.error(`${trainer?.name} is already a trainer at this gym`);
      } else {
        toast.error(errorMsg || 'Failed to send hiring request');
      }
    } finally {
      setHiring(false);
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
      <div className="bg-gray-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition flex items-center gap-2">
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
              {trainer.profilePic ? (
                <img src={trainer.profilePic} alt={trainer.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{trainer.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                <EnvelopeIcon className="w-4 h-4" />
                <span>{trainer.email}</span>
              </div>
              {trainer.phone && (
                <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                  <PhoneIcon className="w-4 h-4" />
                  <span>{trainer.phone}</span>
                </div>
              )}
              {trainer.address && (
                <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{trainer.address}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <VideoCameraIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-white">{courses.length} Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-white">{blogs.length} Blogs</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-white">4.9 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{trainer.followers || 0} Followers</span>
                </div>
              </div>
            </div>
            
            {/* ✅ MESSAGE BUTTON - RIGHT SIDE */}
            <div className="md:text-right">
              {user?.role === 'user' && (
                <button
                  onClick={handleStartChat}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Message
                </button>
              )}
              
              {user?.role === 'owner' && (
                <>
                  <div className="bg-white/10 rounded-lg p-4 mb-3">
                    <label className="text-gray-400 text-sm block mb-2">Select Your Gym to Hire</label>
                    <select
                      value={selectedGym}
                      onChange={(e) => setSelectedGym(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a gym...</option>
                      {gyms.map(gym => (
                        <option key={gym._id} value={gym._id}>{gym.name}</option>
                      ))}
                    </select>
                    {gyms.length === 0 && (
                      <p className="text-yellow-400 text-xs mt-2">
                        You don't have any gyms yet. <button onClick={() => navigate('/owner/create-gym')} className="text-purple-400 underline">Create one</button>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleHire}
                    disabled={!selectedGym || hiring || gyms.length === 0}
                    className="w-full py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <BriefcaseIcon className="w-4 h-4" />
                    {hiring ? 'Sending...' : 'Send Hiring Request'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {trainer.bio && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">About</h2>
            <p className="text-gray-300 leading-relaxed">{trainer.bio}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              {trainer.specialty && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Specialty:</span>
                  <span className="text-purple-400">{trainer.specialty}</span>
                </div>
              )}
              {trainer.experience && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Experience:</span>
                  <span className="text-purple-400">{trainer.experience}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Courses by {trainer.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map(course => (
                <div key={course._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold">{course.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{course.enrolledUsers?.length || 0} students</p>
                  <p className="text-purple-400 text-sm mt-2">${course.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {blogs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Blogs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogs.map(blog => (
                <div key={blog._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold">{blog.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{blog.views || 0} views</p>
                  <p className="text-gray-500 text-xs mt-2">{new Date(blog.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && blogs.length === 0 && !trainer.bio && (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <UserIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No additional information available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerProfile;