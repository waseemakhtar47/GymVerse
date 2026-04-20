import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MapPinIcon,
  CreditCardIcon,
  ChartBarIcon,
  BookOpenIcon,
  PlusCircleIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    const role = user?.role;
    
    const commonItems = [
      { name: 'Dashboard', icon: HomeIcon, path: `/${role}/dashboard` },
      { name: 'Chat', icon: ChatBubbleLeftRightIcon, path: `/${role}/chat` },
      { name: 'Settings', icon: Cog6ToothIcon, path: `/${role}/settings` },
    ];

    const roleSpecificItems = {
      user: [
        { name: 'Find Gyms', icon: MapPinIcon, path: '/user/gyms' },
        { name: 'My Memberships', icon: CreditCardIcon, path: '/user/memberships' },
        { name: 'Courses', icon: VideoCameraIcon, path: '/user/courses' },
        { name: 'Trainers', icon: UserGroupIcon, path: '/user/trainers' },
        { name: 'Blogs', icon: DocumentTextIcon, path: '/user/blogs' },
      ],
      trainer: [
        { name: 'My Courses', icon: VideoCameraIcon, path: '/trainer/courses' },
        { name: 'Create Course', icon: PlusCircleIcon, path: '/trainer/create-course' },
        { name: 'My Blogs', icon: DocumentTextIcon, path: '/trainer/blogs' },
        { name: 'Create Blog', icon: PlusCircleIcon, path: '/trainer/create-blog' },
        { name: 'My Gyms', icon: BuildingOfficeIcon, path: '/trainer/my-gyms' },
        { name: 'Find Jobs', icon: BriefcaseIcon, path: '/trainer/available-gyms' },
        { name: 'My Applications', icon: DocumentTextIcon, path: '/trainer/my-applications' },
        { name: 'Offers', icon: DocumentTextIcon, path: '/trainer/my-requests' },
        { name: 'Followers', icon: UserGroupIcon, path: '/trainer/followers' },
      ],
      owner: [
        { name: 'Manage Gyms', icon: BuildingOfficeIcon, path: '/owner/gyms' },
        { name: 'Create Gym', icon: PlusCircleIcon, path: '/owner/create-gym' },
        { name: 'All Trainers', icon: UserGroupIcon, path: '/owner/trainers' },
        { name: 'Trainer Requests', icon: DocumentTextIcon, path: '/owner/trainer-requests' },
        { name: 'Sent Requests', icon: EnvelopeIcon, path: '/owner/sent-requests' },
      ],
    };

    return [...(roleSpecificItems[role] || []), ...commonItems];
  };

  const navItems = getNavItems();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-purple-600 rounded-lg"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900/95 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              GymVerse
            </h1>
            <p className="text-sm text-gray-400 mt-1 capitalize">{user?.role} Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition w-full"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <div className="lg:hidden">
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-purple-500 to-blue-500 overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;