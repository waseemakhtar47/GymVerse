import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route Component
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
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Role-based dashboards - temporary placeholder pages */}
      <Route 
        path="/user/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <div className="min-h-screen bg-black text-white p-8">
              <h1 className="text-3xl font-bold">User Dashboard</h1>
              <p>Welcome {user?.name}!</p>
            </div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/trainer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['trainer']}>
            <div className="min-h-screen bg-black text-white p-8">
              <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
              <p>Welcome Trainer {user?.name}!</p>
            </div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/owner/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <div className="min-h-screen bg-black text-white p-8">
              <h1 className="text-3xl font-bold">Owner Dashboard</h1>
              <p>Welcome Owner {user?.name}!</p>
            </div>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;