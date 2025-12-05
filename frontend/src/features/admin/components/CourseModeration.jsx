import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaClock, FaEye, FaFlag, FaStar, FaSpinner } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { getAllCourses, approveCourse, rejectCourse } from '@/api/adminApi';
import { format } from 'date-fns';

const CourseModeration = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    flagged: 0,
    rejected: 0,
  });

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllCourses({ status: filterStatus !== 'all' ? filterStatus : undefined });
      const data = response.data || response;
      
      const courseList = data.courses || [];
      setCourses(courseList.map(course => ({
        id: course._id,
        title: course.title,
        instructor: course.instructor?.name || 'Unknown',
        status: course.status || 'pending',
        submittedDate: course.createdAt ? format(new Date(course.createdAt), 'yyyy-MM-dd') : 'N/A',
        price: course.price || 0,
        rating: course.rating?.average || null,
        reviews: course.rating?.count || 0,
        content: course.description?.substring(0, 100) + '...' || 'No description',
      })));

      // Fetch stats for all statuses
      const allCoursesRes = await getAllCourses({});
      const allCourses = allCoursesRes.data?.courses || [];
      setStats({
        pending: allCourses.filter(c => c.status === 'pending').length,
        approved: allCourses.filter(c => c.status === 'approved' || c.status === 'published').length,
        flagged: allCourses.filter(c => c.status === 'flagged').length,
        rejected: allCourses.filter(c => c.status === 'rejected').length,
      });
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter((course) => {
    if (filterStatus === 'all') return true;
    return course.status === filterStatus;
  });

  const handleApproveCourse = async (id) => {
    try {
      setActionLoading(id);
      await approveCourse(id);
      setCourses(courses.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)));
      toast.success('Course approved!');
      fetchCourses();
    } catch (error) {
      console.error('Failed to approve course:', error);
      toast.error('Failed to approve course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCourse = async (id, reason = 'Quality concerns') => {
    try {
      setActionLoading(id);
      await rejectCourse(id, reason);
      setCourses(courses.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)));
      toast.error('Course rejected');
      fetchCourses();
    } catch (error) {
      console.error('Failed to reject course:', error);
      toast.error('Failed to reject course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlagCourse = (id) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, status: c.status === 'flagged' ? 'pending' : 'flagged' } : c)));
    toast.success('Course flagged for review');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'flagged':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Course Moderation</h1>

        {/* Filter Tabs */}
        <Card className="mb-6">
          <div className="p-6 flex gap-3 flex-wrap">
            {['pending', 'approved', 'flagged', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === 'all' 
                  ? Object.values(stats).reduce((a, b) => a + b, 0)
                  : stats[status] || 0})
              </button>
            ))}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Flagged</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.flagged}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </Card>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card key={course.id}>
              <div className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">by {course.instructor}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(course.status)}`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{course.content}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="font-semibold text-gray-900">${course.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Submitted</p>
                      <p className="font-semibold text-gray-900">{course.submittedDate}</p>
                    </div>
                    {course.rating && (
                      <>
                        <div>
                          <p className="text-xs text-gray-600">Rating</p>
                          <p className="font-semibold text-yellow-600">⭐ {course.rating}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Reviews</p>
                          <p className="font-semibold text-gray-900">{course.reviews}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 md:flex-col">
                  {course.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApproveCourse(course.id)}
                        variant="primary"
                        size="sm"
                        icon={<FaCheck />}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectCourse(course.id)}
                        variant="outline"
                        size="sm"
                        icon={<FaTimes />}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleFlagCourse(course.id)}
                        variant="outline"
                        size="sm"
                        icon={<FaFlag />}
                      >
                        Flag
                      </Button>
                    </>
                  )}
                  {course.status === 'flagged' && (
                    <>
                      <Button
                        onClick={() => handleApproveCourse(course.id)}
                        variant="primary"
                        size="sm"
                        icon={<FaCheck />}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectCourse(course.id)}
                        variant="outline"
                        size="sm"
                        icon={<FaTimes />}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseModeration;
