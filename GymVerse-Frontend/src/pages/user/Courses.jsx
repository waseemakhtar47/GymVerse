import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import { courseService } from "../../services/courseService";
import PaymentButton from "../../components/PaymentButton";
import {
  VideoCameraIcon,
  PlayIcon,
  StarIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ Add this
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allCoursesRes, enrolledRes] = await Promise.all([
        courseService.getAllCourses(),
        courseService
          .getMyEnrolledCourses()
          .catch(() => ({ data: { data: [] } })),
      ]);
      setCourses(allCoursesRes.data.data || []);
      setEnrolledCourses(enrolledRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some((c) => c._id === courseId);
  };

  const displayCourses = activeTab === "all" ? courses : enrolledCourses;

  if (loading) {
    return (
      <DashboardLayout title="Courses" role="user">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fitness Courses" role="user">
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg transition ${activeTab === "all" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("enrolled")}
            className={`px-4 py-2 rounded-lg transition ${activeTab === "enrolled" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            My Courses ({enrolledCourses.length})
          </button>
        </div>

        {/* All Courses Tab - with thumbnail on card */}
        {activeTab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <VideoCameraIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Courses Available
                </h3>
                <p className="text-gray-400">
                  Check back later for new fitness courses.
                </p>
              </div>
            ) : (
              displayCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition"
                >
                  {/* ✅ Thumbnail on top */}
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="h-48 bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <VideoCameraIcon className="w-12 h-12 text-white/50" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                        {course.level || "Beginner"}
                      </span>
                      <span className="text-purple-400 font-bold">
                        ₹{course.price || 0}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-linear-to-r from-purple-500 to-blue-500 overflow-hidden flex items-center justify-center">
                        {course.trainerId?.profilePic ? (
                          <img
                            src={course.trainerId.profilePic}
                            alt={course.trainerId?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-400 text-xs">
                        By {course.trainerId?.name || "Trainer"}
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-3 h-3 text-yellow-500" />
                        <span>4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>
                          {course.enrolledUsers?.length || 0} students
                        </span>
                      </div>
                    </div>

                    {isEnrolled(course._id) ? (
                      <button
                        onClick={() => navigate(`/course-player/${course._id}`)}
                        className="w-full py-2 bg-green-600 rounded-lg text-white text-sm flex items-center justify-center gap-1 hover:bg-green-700 transition"
                      >
                        <PlayIcon className="w-4 h-4" />
                        Start Learning
                      </button>
                    ) : (
                      <PaymentButton
                        type="course"
                        itemId={course._id}
                        amount={course.price || 0}
                        buttonText={`Enroll Now - ₹${course.price || 0}`}
                        onSuccess={() => {
                          setRefreshKey((prev) => prev + 1);
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === "enrolled" && (
          <div>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <VideoCameraIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Enrolled Courses
                </h3>
                <p className="text-gray-400">
                  You haven't enrolled in any courses yet.
                </p>
                <button
                  onClick={() => setActiveTab("all")}
                  className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const isValid = course.enrollmentDetails?.isValid;
                  const daysRemaining =
                    course.enrollmentDetails?.daysRemaining || 0;
                  const validUntil = course.enrollmentDetails?.validUntil;

                  return (
                    <div
                      key={course._id}
                      className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10"
                    >
                      <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4">
                        <h3 className="text-white font-bold text-lg">
                          {course.title}
                        </h3>
                        <p className="text-white/80 text-sm">
                          By {course.trainerId?.name}
                        </p>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${isValid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                          >
                            {isValid ? "Active" : "Expired"}
                          </span>
                          {isValid && daysRemaining > 0 && (
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {daysRemaining} days left
                            </span>
                          )}
                        </div>

                        {validUntil && (
                          <p className="text-gray-500 text-xs mb-3">
                            Valid until:{" "}
                            {new Date(validUntil).toLocaleDateString()}
                          </p>
                        )}

                        {isValid ? (
                          <button
                            onClick={() =>
                              navigate(`/course-player/${course._id}`)
                            }
                            className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition"
                          >
                            Continue Learning
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab("all")}
                            className="w-full py-2 bg-gray-600 rounded-lg text-white text-sm hover:bg-gray-700 transition"
                          >
                            Repurchase Course
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses;
