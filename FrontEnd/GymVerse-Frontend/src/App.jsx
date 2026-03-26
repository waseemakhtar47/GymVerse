import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/user/UserDashboard';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import BlogFeed from './pages/BlogFeed';
import CreateBlog from './pages/CreateBlog';
import GymDiscovery from './pages/user/GymDiscovery';
import MyMemberships from './pages/user/MyMemberships';
import Courses from './pages/user/Courses';
import CreateCourse from './pages/trainer/CreateCourse';
import MyCourses from './pages/trainer/MyCourses';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* User Routes */}
      <Route 
        path="/user/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user/blogs" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <BlogFeed />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user/gyms" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <GymDiscovery />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user/memberships" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <MyMemberships />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user/courses" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Courses />
          </ProtectedRoute>
        } 
      />
      
      {/* Trainer Routes */}
      <Route 
        path="/trainer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <TrainerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trainer/blogs" 
        element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <BlogFeed />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trainer/create-blog" 
        element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <CreateBlog />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trainer/courses" 
        element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <MyCourses />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trainer/create-course" 
        element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <CreateCourse />
          </ProtectedRoute>
        } 
      />
      
      {/* Owner Routes */}
      <Route 
        path="/owner/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;