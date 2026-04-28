import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  BackwardIcon,
  ForwardIcon,
  VideoCameraIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    fetchCourseData();
    if (user) {
      checkAccess();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      const res = await courseService.getCourseById(courseId);
      setCourse(res.data.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('Course not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    try {
      const res = await courseService.checkCourseAccess(courseId);
      const accessData = res.data.data;
      setHasAccess(accessData.hasAccess);
      setIsOwner(accessData.isOwner || false);
      setAccessInfo(accessData);
      
      if (!accessData.hasAccess && !accessData.isOwner) {
        toast.error(accessData.reason || 'You do not have access to this course');
      }
    } catch (error) {
      console.error('Failed to check access:', error);
      setHasAccess(false);
      setIsOwner(false);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (!hasAccess && !isOwner) {
      toast.error('You do not have access to this course');
      return;
    }
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (progressBarRef.current) {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        progressBarRef.current.style.width = `${progress}%`;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    const newTime = percentage * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">Course not found</div>
      </div>
    );
  }

  const canAccess = hasAccess || isOwner;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition flex items-center gap-2">
              <ArrowLeftIcon className="w-5 h-5" />
              Back
            </button>
            
            {/* ✅ Edit button for trainer/owner */}
            {isOwner && (
              <button
                onClick={() => navigate(`/trainer/edit-course/${courseId}`)}
                className="px-4 py-2 bg-green-600 rounded-lg text-white text-sm hover:bg-green-700 transition flex items-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Course
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div ref={containerRef} className="bg-black rounded-xl overflow-hidden">
              {canAccess ? (
                <>
                  <video
                    ref={videoRef}
                    src={course.videoUrl || course.videoFile}
                    className="w-full aspect-video"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    poster={course.thumbnail}
                  />
                  
                  {/* Custom Controls */}
                  <div className="bg-gray-900 p-4">
                    {/* Progress Bar */}
                    <div 
                      className="w-full h-1 bg-gray-700 rounded-full mb-4 cursor-pointer relative group"
                      onClick={handleSeek}
                    >
                      <div 
                        ref={progressBarRef}
                        className="h-1 bg-purple-600 rounded-full relative"
                        style={{ width: '0%' }}
                      >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition"></div>
                      </div>
                    </div>
                    
                    {/* Controls Row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlay}
                          className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                          {isPlaying ? <PauseIcon className="w-5 h-5 text-white" /> : <PlayIcon className="w-5 h-5 text-white" />}
                        </button>
                        
                        <button
                          onClick={skipBackward}
                          className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                          <BackwardIcon className="w-5 h-5 text-white" />
                        </button>
                        
                        <button
                          onClick={skipForward}
                          className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                          <ForwardIcon className="w-5 h-5 text-white" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleMute}
                            className="p-2 hover:bg-white/10 rounded-lg transition"
                          >
                            {isMuted || volume === 0 ? <SpeakerXMarkIcon className="w-5 h-5 text-white" /> : <SpeakerWaveIcon className="w-5 h-5 text-white" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                        </div>
                        
                        <div className="text-gray-400 text-sm ml-2">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                            className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                          >
                            {playbackSpeed}x
                          </button>
                          {showSpeedMenu && (
                            <div className="absolute bottom-full mb-2 right-0 bg-gray-800 rounded-lg shadow-xl border border-white/10 overflow-hidden z-10">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => changePlaybackSpeed(speed)}
                                  className={`block w-full px-4 py-2 text-sm hover:bg-white/10 transition text-left ${
                                    playbackSpeed === speed ? 'text-purple-400 bg-white/5' : 'text-white'
                                  }`}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={toggleFullscreen}
                          className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                          {isFullscreen ? <ArrowsPointingInIcon className="w-5 h-5 text-white" /> : <ArrowsPointingOutIcon className="w-5 h-5 text-white" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">You don't have access to this course</p>
                    <button
                      onClick={() => navigate('/user/courses')}
                      className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white"
                    >
                      Browse Courses
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Course Info Section */}
          <div className="space-y-6">
            {/* Course Title & Meta */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">By {course.trainerId?.name}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-300">4.8</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{course.enrolledUsers?.length || 0} students</span>
                </div>
              </div>
            </div>

            {/* Access Status */}
            {isOwner ? (
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500">
                <div className="flex items-center gap-2">
                  <VideoCameraIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-semibold text-blue-400">Course Owner Access</p>
                    <p className="text-gray-400 text-sm mt-1">
                      You are the creator of this course. Full access granted.
                    </p>
                  </div>
                </div>
              </div>
            ) : hasAccess ? (
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-semibold text-green-400">Access Granted</p>
                    {accessInfo && (
                      <p className="text-gray-400 text-sm mt-1">
                        Valid until: {new Date(accessInfo.validUntil).toLocaleDateString()}
                        <br />
                        {accessInfo.daysRemaining} days remaining
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-semibold text-red-400">Access Denied</p>
                    <p className="text-gray-400 text-sm mt-1">
                      You need to purchase this course to access it.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-3">About this course</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{course.description}</p>
            </div>

            {/* Course Details */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-3">Course Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Level</span>
                  <span className="text-white capitalize">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white capitalize">{course.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price</span>
                  <span className="text-purple-400 font-bold">₹{course.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;