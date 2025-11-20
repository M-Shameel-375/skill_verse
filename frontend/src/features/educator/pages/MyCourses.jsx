// ============================================
// MY COURSES PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaStar,
  FaEllipsisV,
} from 'react-icons/fa';
import {
  getMyCourses,
  deleteCourse,
  selectMyCourses,
  selectCourseLoading,
} from '../../../redux/slices/courseSlice';
import useAuth from '../../../hooks/useAuth';
import config from '../../../config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CardSkeletonLoader } from '../../shared/components/Loader';
import { DeleteConfirmModal } from '../../shared/components/Modal';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import toast from 'react-hot-toast';

// ============================================
// MY COURSE CARD
// ============================================
const MyCourseCard = ({ course, onEdit, onDelete, onView }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="relative">
      <img
        src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
        alt={course.title}
        className="w-full h-auto aspect-[16/9] object-cover rounded-t-lg"
      />
      
      {/* Status Badge */}
      <div className="absolute top-4 left-4">
        <span
          className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
            course.status === 'published' ? 'bg-green-100 text-green-800' :
            course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {course.status}
        </span>
      </div>

      {/* Menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <FaEllipsisV className="text-gray-600" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
              <button
                onClick={() => {
                  onView(course._id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <FaEye /> View Course
              </button>
              <button
                onClick={() => {
                  onEdit(course._id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => {
                  onDelete(course);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaUsers />
            <span>{course.enrolledCount || 0} students</span>
          </div>
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-500" />
            <span>{course.rating?.average?.toFixed(1) || '0.0'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            Updated {formatDate(course.updatedAt, 'MMM dd, yyyy')}
          </span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(course.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// MY COURSES PAGE
// ============================================
const MyCourses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  const myCourses = useSelector(selectMyCourses);
  const loading = useSelector(selectCourseLoading);
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, course: null });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    dispatch(getMyCourses());
  }, [dispatch]);

  const handleDeleteCourse = async () => {
    try {
      await dispatch(deleteCourse(deleteModal.course._id)).unwrap();
      toast.success('Course deleted successfully');
      setDeleteModal({ isOpen: false, course: null });
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const filteredCourses = filterStatus === 'all'
    ? myCourses
    : myCourses.filter(course => course.status === filterStatus);

  if (userRole !== config.roles.EDUCATOR && userRole !== config.roles.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Educator Access Required
          </h2>
          <p className="text-gray-600 mb-4">
            You need to be an educator to access this page
          </p>
          <Button onClick={() => navigate(config.routes.dashboard)}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Courses | {config.app.name}</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">Manage your created courses</p>
          </div>
          
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={() => navigate('/educator/courses/create')}
          >
            Create Course
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'published', 'draft', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <CardSkeletonLoader count={6} />
        ) : filteredCourses.length === 0 ? (
          <Card padding="xl" className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start creating courses to share your knowledge
            </p>
            <Button
              variant="primary"
              icon={<FaPlus />}
              onClick={() => navigate('/educator/courses/create')}
            >
              Create Your First Course
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <MyCourseCard
                key={course._id}
                course={course}
                onView={(id) => navigate(`/courses/${id}`)}
                onEdit={(id) => navigate(`/educator/courses/edit/${id}`)}
                onDelete={(course) => setDeleteModal({ isOpen: true, course })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, course: null })}
        onConfirm={handleDeleteCourse}
        itemName={deleteModal.course?.title}
      />
    </>
  );
};

export default MyCourses;