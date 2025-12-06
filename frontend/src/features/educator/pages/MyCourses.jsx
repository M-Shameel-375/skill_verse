// ============================================
// MY COURSES PAGE - UPDATED
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
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
  FaSpinner,
} from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMyCourses, deleteCourse } from '@/api/courseApi';
import toast from 'react-hot-toast';

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatCurrency = (amount) => {
  if (amount === 0) return 'Free';
  return `$${(amount || 0).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ============================================
// MY COURSE CARD COMPONENT
// ============================================
const MyCourseCard = ({ course, onEdit, onDelete, onView }) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={course.thumbnail?.url || course.thumbnail || '/placeholder-course.jpg'}
          alt={course.title}
          className="w-full h-auto aspect-[16/9] object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-course.jpg';
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`capitalize px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[course.status] || statusColors.draft
              }`}
          >
            {course.status || 'Draft'}
          </span>
        </div>

        {/* Menu Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <FaEllipsisV className="text-gray-600 h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1">
                <button
                  onClick={() => {
                    onView(course._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FaEye className="text-gray-500" /> View Course
                </button>
                <button
                  onClick={() => {
                    onEdit(course._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FaEdit className="text-gray-500" /> Edit Course
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete(course);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FaTrash /> Delete Course
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaUsers className="h-4 w-4" />
            <span>{course.enrolledStudents?.length || course.enrolledCount || 0} students</span>
          </div>
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-500 h-4 w-4" />
            <span>{course.rating?.average?.toFixed(1) || '0.0'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            Updated {formatDate(course.updatedAt)}
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
// DELETE CONFIRM MODAL
// ============================================
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, courseName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Course?</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "<span className="font-medium">{courseName}</span>"?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MY COURSES PAGE COMPONENT
// ============================================
const MyCourses = () => {
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, course: null });
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyCourses();
      const data = response?.data?.data || response?.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Handle delete
  const handleDeleteCourse = async () => {
    if (!deleteModal.course) return;

    try {
      setDeleting(true);
      await deleteCourse(deleteModal.course._id);
      toast.success('Course deleted successfully');
      setCourses((prev) => prev.filter((c) => c._id !== deleteModal.course._id));
      setDeleteModal({ isOpen: false, course: null });
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error(error.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  // Filter courses
  const filteredCourses =
    filterStatus === 'all'
      ? courses
      : courses.filter((course) => course.status === filterStatus);

  // Stats
  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    archived: courses.filter((c) => c.status === 'archived').length,
  };

  return (
    <>
      <Helmet>
        <title>My Courses | SkillVerse</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">
              Manage your created courses ({stats.total} total, {stats.published} published)
            </p>
          </div>

          <Button onClick={() => navigate('/educator/courses/create')}>
            <FaPlus className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: `All (${stats.total})` },
            { value: 'published', label: `Published (${stats.published})` },
            { value: 'draft', label: `Draft (${stats.draft})` },
            { value: 'archived', label: `Archived (${stats.archived})` },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filterStatus === 'all' ? 'No courses yet' : `No ${filterStatus} courses`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all'
                ? 'Start creating courses to share your knowledge'
                : `You don't have any ${filterStatus} courses`}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => navigate('/educator/courses/create')}>
                <FaPlus className="mr-2 h-4 w-4" /> Create Your First Course
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <MyCourseCard
                key={course._id}
                course={course}
                onView={(id) => navigate(`/courses/${id}`)}
                onEdit={(id) => navigate(`/educator/courses/${id}/edit`)}
                onDelete={(course) => setDeleteModal({ isOpen: true, course })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, course: null })}
        onConfirm={handleDeleteCourse}
        courseName={deleteModal.course?.title}
        loading={deleting}
      />
    </>
  );
};

export default MyCourses;