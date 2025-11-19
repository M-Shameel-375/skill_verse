import React, { useState } from 'react';
import { FaCheck, FaTimes, FaClock, FaEye, FaFlag, FaStar } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CourseModeration = () => {
  const [courses, setCourses] = useState([
    { id: 1, title: 'React Fundamentals', instructor: 'Sarah Smith', status: 'pending', submittedDate: '2024-02-10', price: 49, rating: 4.8, reviews: 120, content: 'Video lectures, assignments, quizzes' },
    { id: 2, title: 'Python for Beginners', instructor: 'John Doe', status: 'pending', submittedDate: '2024-02-08', price: 39, rating: null, reviews: 0, content: 'Interactive tutorials and exercises' },
    { id: 3, title: 'Web Design Masterclass', instructor: 'Emma Wilson', status: 'approved', submittedDate: '2024-01-20', price: 59, rating: 4.9, reviews: 85, content: 'Design principles, tools, projects' },
    { id: 4, title: 'Node.js Advanced', instructor: 'Alex Brown', status: 'flagged', submittedDate: '2024-02-05', price: 79, rating: 4.6, reviews: 45, content: 'Advanced backend development' },
    { id: 5, title: 'JavaScript ES6+', instructor: 'Mike Johnson', status: 'rejected', submittedDate: '2024-01-30', price: 44, rating: null, reviews: 0, content: 'Modern JavaScript features' },
  ]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filteredCourses = courses.filter((course) => {
    if (filterStatus === 'all') return true;
    return course.status === filterStatus;
  });

  const handleApproveCourse = (id) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)));
    toast.success('Course approved!');
  };

  const handleRejectCourse = (id, reason = 'Quality concerns') => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)));
    toast.error('Course rejected');
  };

  const handleFlagCourse = (id) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, status: c.status === 'flagged' ? 'pending' : 'flagged' } : c)));
    toast.success('Course flagged for review');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'flagged':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

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
                {status === 'all' ? courses.length : courses.filter((c) => c.status === status).length})
              </button>
            ))}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-blue-600">{courses.filter((c) => c.status === 'pending').length}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600">{courses.filter((c) => c.status === 'approved').length}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Flagged</p>
              <p className="text-3xl font-bold text-yellow-600">{courses.filter((c) => c.status === 'flagged').length}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{courses.filter((c) => c.status === 'rejected').length}</p>
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
