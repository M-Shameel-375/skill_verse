import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { FaChalkboardTeacher, FaPlus, FaUsers, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { getMyCourses } from '../../../api/courseApi';
import { getEarnings } from '../../../api/paymentApi';
import toast from 'react-hot-toast';

const EducatorDashboard = ({ user: dbUser }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await getMyCourses().catch(err => ({ data: [] }));
        const earningsRes = await getEarnings().catch(err => ({ data: {} }));

        const courses = coursesRes.data || [];
        const earnings = earningsRes.data || {};

        const totalStudents = courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0);
        const totalEarnings = earnings.summary?.total || 0;
        const avgRating = courses.reduce((acc, course) => acc + (course.rating || 0), 0) / (courses.length || 1);

        setStats({
          totalStudents,
          totalCourses: courses.length,
          totalEarnings,
          averageRating: avgRating.toFixed(1),
        });

        setRecentCourses(courses.slice(0, 5));
      } catch (error) {
        console.error('Error fetching educator data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = dbUser?.name || user?.firstName || 'Educator';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Educator Dashboard | SkillVerse</title>
      </Helmet>

      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}! 📚
            </h1>
            <p className="text-gray-600">
              Manage your courses and track your teaching progress.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              👨‍🏫 Educator
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link
            to="/educator/quiz/create"
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-50"
          >
            <FaPlus /> Create Quiz
          </Link>
          <Link
            to="/educator/courses/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <FaPlus /> Create New Course
          </Link>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FaUsers className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <FaMoneyBillWave className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FaChalkboardTeacher className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Average Rating</h3>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FaStar className="text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Recent Courses</h2>
          <Link to="/educator/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentCourses.length > 0 ? (
            recentCourses.map((course) => (
              <div key={course._id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <img
                    src={course.thumbnail?.url || 'https://via.placeholder.com/100x60'}
                    alt={course.title}
                    className="w-16 h-10 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-500">
                      {course.enrolledStudents?.length || 0} students • ${course.price}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.status || 'Draft'}
                  </span>
                  <Link
                    to={`/courses/edit/${course._id}`}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No courses yet. Create your first course to get started!
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default EducatorDashboard;
