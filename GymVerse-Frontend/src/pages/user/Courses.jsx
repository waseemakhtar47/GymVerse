import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import { courseService } from "../../services/courseService";
import PaymentButton from "../../components/PaymentButton";
import StarRating from "../../components/StarRating";
import CourseRatingModal from "../../components/CourseRatingModal";
import {
  VideoCameraIcon,
  PlayIcon,
  StarIcon,
  UserIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [activeCourses, setActiveCourses] = useState([]);
  const [expiredCourses, setExpiredCourses] = useState([]);
  const [cancelledCourses, setCancelledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedCourseForRating, setSelectedCourseForRating] = useState(null);
  const [selectedCourseForReviews, setSelectedCourseForReviews] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // First check and update expired enrollments
      await courseService.checkExpiredEnrollments().catch(() => {});

      const [allCoursesRes, enrolledRes] = await Promise.all([
        courseService.getAllCourses(),
        courseService
          .getMyEnrolledCourses()
          .catch(() => ({ data: { data: [] } })),
      ]);
      setCourses(allCoursesRes.data.data || []);

      const enrolled = enrolledRes.data.data || [];

      // Separate enrolled courses into active, expired, cancelled
      const active = enrolled.filter(
        (c) => c.enrollmentDetails?.status === "active"
      );
      const expired = enrolled.filter(
        (c) => c.enrollmentDetails?.status === "expired"
      );
      const cancelled = enrolled.filter(
        (c) => c.enrollmentDetails?.status === "cancelled"
      );

      setActiveCourses(active);
      setExpiredCourses(expired);
      setCancelledCourses(cancelled);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only active courses should show "Start Learning"
  const isEnrolled = (courseId) => {
    return activeCourses.some((c) => c._id === courseId);
  };

  const handleRatingSubmitted = async () => {
    await fetchData();
    toast.success("Rating updated successfully!");
  };

  const handleCancelEnrollment = async (courseId, courseTitle) => {
    if (
      !confirm(
        `Are you sure you want to cancel enrollment for "${courseTitle}"? You will lose access to this course.`
      )
    ) {
      return;
    }

    try {
      await courseService.cancelEnrollment(courseId);
      toast.success("Enrollment cancelled successfully");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel enrollment"
      );
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    toast.success("Refreshed!");
  };

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
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2 flex-wrap items-center">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "all"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "active"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Active ({activeCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "expired"
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Expired ({expiredCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "cancelled"
                ? "bg-gray-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Cancelled ({cancelledCourses.length})
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="ml-auto px-3 py-2 bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
            title="Refresh"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>

          {/* Clean Cancelled Button */}
          <button
            onClick={async () => {
              if (
                confirm(
                  "Remove all cancelled courses from history? This will allow you to purchase them again."
                )
              ) {
                try {
                  await courseService.cleanCancelledEnrollments();
                  toast.success("Cancelled courses removed from history");
                  setRefreshKey((prev) => prev + 1);
                } catch (error) {
                  toast.error("Failed to clean");
                }
              }
            }}
            className="px-3 py-2 bg-red-600/20 rounded-lg text-red-400 hover:bg-red-600/30 transition"
            title="Clean Cancelled Enrollments"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {/* All Courses Tab */}
        {activeTab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
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
              courses.map((course) => {
                const isUserEnrolled = isEnrolled(course._id);

                return (
                  <div
                    key={course._id}
                    className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition"
                  >
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

                      {/* Rating Display */}
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating
                          rating={course.averageRating || 0}
                          size="sm"
                          readonly={true}
                        />
                        <span className="text-gray-400 text-xs">
                          {course.averageRating
                            ? course.averageRating.toFixed(1)
                            : "New"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ({course.totalReviews || 0}{" "}
                          {course.totalReviews === 1 ? "review" : "reviews"})
                        </span>
                      </div>

                      {/* View Reviews Button */}
                      <button
                        onClick={() => {
                          setSelectedCourseForReviews(course);
                          setShowReviewsModal(true);
                        }}
                        className="w-full mt-3 py-1.5 border border-blue-500 rounded-lg text-blue-400 text-xs hover:bg-blue-500/10 transition flex items-center justify-center gap-1"
                      >
                        <EyeIcon className="w-3 h-3" />
                        View All Reviews
                      </button>

                      <p className="text-gray-400 text-xs mb-3 line-clamp-2 mt-2">
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

                      {isUserEnrolled ? (
                        <button
                          onClick={() =>
                            navigate(`/course-player/${course._id}`)
                          }
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
                            setTimeout(() => {
                              setRefreshKey((prev) => prev + 1);
                            }, 2000);
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Active Courses Tab */}
        {activeTab === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <VideoCameraIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Active Courses
                </h3>
                <p className="text-gray-400">
                  You don't have any active courses.
                </p>
                <button
                  onClick={() => setActiveTab("all")}
                  className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              activeCourses.map((course) => {
                const daysRemaining =
                  course.enrollmentDetails?.daysRemaining || 0;
                const validUntil = course.enrollmentDetails?.validUntil;
                const hasUserRated = course.userRating !== null;

                return (
                  <div
                    key={course._id}
                    className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-green-500/30 hover:scale-105 transition"
                  >
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="h-40 bg-linear-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                        <VideoCameraIcon className="w-10 h-10 text-white/50" />
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
                        {course.title}
                      </h3>

                      <p className="text-gray-400 text-xs mb-2">
                        By {course.trainerId?.name}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <StarRating
                          rating={course.averageRating || 0}
                          size="sm"
                          readonly={true}
                        />
                        <span className="text-gray-400 text-xs">
                          {course.averageRating
                            ? course.averageRating.toFixed(1)
                            : "No ratings yet"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ({course.totalReviews || 0} reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                          Active
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {daysRemaining} days left
                        </span>
                      </div>

                      {validUntil && (
                        <p className="text-gray-500 text-xs mb-3">
                          Valid until:{" "}
                          {new Date(validUntil).toLocaleDateString()}
                        </p>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() =>
                            navigate(`/course-player/${course._id}`)
                          }
                          className="flex-1 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition"
                        >
                          Continue Learning
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCourseForReviews(course);
                            setShowReviewsModal(true);
                          }}
                          className="px-3 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-700 transition flex items-center gap-1"
                          title="View All Reviews"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Reviews
                        </button>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setSelectedCourseForRating(course);
                            setShowRatingModal(true);
                          }}
                          className="flex-1 py-1.5 border border-yellow-500 rounded-lg text-yellow-400 text-xs hover:bg-yellow-500/10 transition flex items-center justify-center gap-1"
                        >
                          <StarIcon className="w-3 h-3" />
                          {hasUserRated ? "Update Rating" : "Rate Course"}
                        </button>

                        <button
                          onClick={() =>
                            handleCancelEnrollment(course._id, course.title)
                          }
                          className="flex-1 py-1.5 border border-red-500 rounded-lg text-red-400 text-xs hover:bg-red-500/10 transition flex items-center justify-center gap-1"
                        >
                          <TrashIcon className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Expired Courses Tab */}
        {activeTab === "expired" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expiredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <VideoCameraIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Expired Courses
                </h3>
                <p className="text-gray-400">
                  Your active courses are all up to date.
                </p>
              </div>
            ) : (
              expiredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-red-500/30 opacity-80"
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-40 object-cover grayscale"
                    />
                  ) : (
                    <div className="h-40 bg-gray-700 flex items-center justify-center">
                      <VideoCameraIcon className="w-10 h-10 text-gray-500" />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {course.title}
                    </h3>

                    <p className="text-gray-400 text-xs mb-2">
                      By {course.trainerId?.name}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <StarRating
                        rating={course.averageRating || 0}
                        size="sm"
                        readonly={true}
                      />
                      <span className="text-gray-400 text-xs">
                        {course.averageRating
                          ? course.averageRating.toFixed(1)
                          : "No ratings"}
                      </span>
                    </div>

                    <div className="mt-3 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                        Expired
                      </span>
                    </div>

                    <p className="text-gray-500 text-xs mb-3">
                      Expired on:{" "}
                      {new Date(
                        course.enrollmentDetails?.validUntil
                      ).toLocaleDateString()}
                    </p>

                    <PaymentButton
                      type="course"
                      itemId={course._id}
                      amount={course.price || 0}
                      buttonText={`Repurchase - ₹${course.price || 0}`}
                      onSuccess={() => {
                        setTimeout(() => {
                          setRefreshKey((prev) => prev + 1);
                        }, 2000);
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Cancelled Courses Tab */}
        {activeTab === "cancelled" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cancelledCourses.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <VideoCameraIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Cancelled Courses
                </h3>
                <p className="text-gray-400">
                  You haven't cancelled any courses.
                </p>
              </div>
            ) : (
              cancelledCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-500/30 opacity-70"
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-40 object-cover grayscale"
                    />
                  ) : (
                    <div className="h-40 bg-gray-800 flex items-center justify-center">
                      <VideoCameraIcon className="w-10 h-10 text-gray-600" />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {course.title}
                    </h3>

                    <p className="text-gray-400 text-xs mb-2">
                      By {course.trainerId?.name}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <StarRating
                        rating={course.averageRating || 0}
                        size="sm"
                        readonly={true}
                      />
                      <span className="text-gray-400 text-xs">
                        {course.averageRating
                          ? course.averageRating.toFixed(1)
                          : "No ratings"}
                      </span>
                    </div>

                    <div className="mt-3 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                        Cancelled
                      </span>
                    </div>

                    <p className="text-gray-500 text-xs mb-3">
                      Cancelled on:{" "}
                      {new Date(
                        course.enrollmentDetails?.cancelledAt ||
                          course.updatedAt
                      ).toLocaleDateString()}
                    </p>

                    <PaymentButton
                      type="course"
                      itemId={course._id}
                      amount={course.price || 0}
                      buttonText={`Buy Again - ₹${course.price || 0}`}
                      onSuccess={() => {
                        setTimeout(() => {
                          setRefreshKey((prev) => prev + 1);
                        }, 2000);
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Rating/Update Modal */}
      {showRatingModal && selectedCourseForRating && (
        <CourseRatingModal
          course={selectedCourseForRating}
          mode="rating"
          onClose={() => {
            setShowRatingModal(false);
            setSelectedCourseForRating(null);
          }}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      {/* Reviews Modal */}
      {showReviewsModal && selectedCourseForReviews && (
        <CourseRatingModal
          course={selectedCourseForReviews}
          mode="reviews"
          onClose={() => {
            setShowReviewsModal(false);
            setSelectedCourseForReviews(null);
          }}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </DashboardLayout>
  );
};

export default Courses;