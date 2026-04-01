import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/user/UserDashboard";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import BlogFeed from "./pages/BlogFeed";
import CreateBlog from "./pages/CreateBlog";
import GymDiscovery from "./pages/user/GymDiscovery";
import MyMemberships from "./pages/user/MyMemberships";
import Courses from "./pages/user/Courses";
import CreateCourse from "./pages/trainer/CreateCourse";
import MyCourses from "./pages/trainer/MyCourses";
import Trainers from "./pages/user/Trainers";
import Followers from "./pages/trainer/Followers";
import ManageGyms from "./pages/owner/ManageGyms";
import CreateGym from "./pages/owner/CreateGym";
import EditGym from "./pages/owner/EditGym";
import GymMemberships from "./pages/owner/GymMemberships";
import AvailableGyms from "./pages/trainer/AvailableGyms";
import MyApplications from "./pages/trainer/MyApplications";
import GymApplications from "./pages/owner/GymApplications";
import GymTrainers from "./pages/owner/GymTrainers";
import OwnerTrainers from "./pages/owner/OwnerTrainers";
import Settings from "./pages/Settings";
import TrainerProfile from "./pages/TrainerProfile";
import MyRequests from "./pages/trainer/MyRequests";
import GymSentRequests from "./pages/owner/GymSentRequests";
import AllTrainerRequests from "./pages/owner/AllTrainerRequests";
import AllSentRequests from "./pages/owner/AllSentRequests";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
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
      <Route path="/trainer-profile/:id" element={<TrainerProfile />} />

      {/* User Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/settings"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/blogs"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <BlogFeed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/gyms"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <GymDiscovery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/memberships"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <MyMemberships />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/courses"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/trainers"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Trainers />
          </ProtectedRoute>
        }
      />

      {/* Trainer Routes */}
      <Route
        path="/trainer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <TrainerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/my-requests"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <MyRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/settings"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/blogs"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <BlogFeed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/create-blog"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <CreateBlog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/courses"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <MyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/create-course"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <CreateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/followers"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <Followers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/available-gyms"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <AvailableGyms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/my-applications"
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <MyApplications />
          </ProtectedRoute>
        }
      />

      {/* Owner Routes */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/sent-requests"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <AllSentRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/trainer-requests"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <AllTrainerRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/gym-sent-requests/:gymId"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <GymSentRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/settings"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/gyms"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <ManageGyms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/create-gym"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <CreateGym />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/edit-gym/:id"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <EditGym />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/memberships/:gymId"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <GymMemberships />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/gym-applications/:gymId"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <GymApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/gym-trainers/:gymId"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <GymTrainers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/trainers"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerTrainers />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
