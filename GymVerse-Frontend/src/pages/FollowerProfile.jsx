import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import DashboardLayout from '../components/DashboardLayout';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FollowerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [follower, setFollower] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowerData();
  }, [id]);

  const fetchFollowerData = async () => {
    setLoading(true);
    try {
      const res = await userService.getUserById(id);
      setFollower(res.data.data);
    } catch (error) {
      console.error('Failed to fetch follower:', error);
      toast.error('User not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!follower) return;
    try {
      const res = await chatService.getOrCreateChat(follower._id);
      const chatId = res.data.data._id;
      navigate(`/${user?.role}/chat?chatId=${chatId}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="User Profile" role="trainer">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!follower) {
    return (
      <DashboardLayout title="User Profile" role="trainer">
        <div className="text-center text-white py-10">User not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Profile - ${follower.name}`} role="trainer">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
              {follower.profilePic ? (
                <img src={follower.profilePic} alt={follower.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-white" />
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{follower.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm capitalize">
                  {follower.role}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{follower.email}</span>
                </div>
                {follower.phone && (
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{follower.phone}</span>
                  </div>
                )}
                {follower.address && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{follower.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Joined: {new Date(follower.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="md:text-right">
              <button
                onClick={handleStartChat}
                className="w-full md:w-auto px-6 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Send Message
              </button>
            </div>
          </div>
          
          {/* Bio Section */}
          {follower.bio && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-semibold mb-2">About</h3>
              <p className="text-gray-300">{follower.bio}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FollowerProfile;