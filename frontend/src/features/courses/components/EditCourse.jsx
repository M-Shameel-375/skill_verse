import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaArrowLeft, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import { FullPageLoader } from '../common/Loader';
import toast from 'react-hot-toast';
import { getCourseById, updateCourse } from '@/api/courseApi';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters'),
  category: Yup.string().required('Category is required'),
  level: Yup.string().required('Level is required'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price cannot be negative'),
  tags: Yup.string(),
  prerequisites: Yup.string(),
  objectives: Yup.string(),
});

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);

  // Fetch course data
  const fetchCourse = useCallback(async () => {
    if (!id) {
      setError('Course ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getCourseById(id);
      
      if (response.data?.data) {
        setCourse(response.data.data);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      if (err.response?.status === 404) {
        setError('Course not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to edit this course');
      } else {
        setError('Failed to load course data');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  if (loading) return <FullPageLoader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="primary" onClick={fetchCourse}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const initialValues = {
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || 'programming',
    level: course?.level || 'beginner',
    price: course?.price || 0,
    tags: course?.tags?.join(', ') || '',
    prerequisites: course?.prerequisites?.join('\n') || '',
    objectives: course?.objectives?.join('\n') || '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Prepare update data
      const updateData = {
        title: values.title,
        description: values.description,
        category: values.category,
        level: values.level,
        price: Number(values.price),
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        prerequisites: values.prerequisites ? values.prerequisites.split('\n').map(p => p.trim()).filter(Boolean) : [],
        objectives: values.objectives ? values.objectives.split('\n').map(o => o.trim()).filter(Boolean) : [],
      };

      await updateCourse(id, updateData);
      toast.success('Course updated successfully!');
      navigate(`/courses/${id}`);
    } catch (error) {
      console.error('Error updating course:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to edit this course');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update course');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Course</h1>

        <Formik 
          initialValues={initialValues} 
          validationSchema={validationSchema} 
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-6">
              <Card>
                <div className="p-6 space-y-6">
                  {/* Course Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Enter course title"
                      className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Field 
                      as="textarea" 
                      id="description" 
                      name="description" 
                      rows="5" 
                      placeholder="Describe your course content and what students will learn"
                      className={`w-full px-4 py-2 border ${touched.description && errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* Category & Level */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <Field 
                        as="select" 
                        id="category" 
                        name="category" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="programming">Programming</option>
                        <option value="web-development">Web Development</option>
                        <option value="mobile-development">Mobile Development</option>
                        <option value="data-science">Data Science</option>
                        <option value="machine-learning">Machine Learning</option>
                        <option value="design">Design</option>
                        <option value="business">Business</option>
                        <option value="marketing">Marketing</option>
                        <option value="photography">Photography</option>
                        <option value="music">Music</option>
                        <option value="other">Other</option>
                      </Field>
                      <ErrorMessage name="category" component="p" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                        Level
                      </label>
                      <Field 
                        as="select" 
                        id="level" 
                        name="level" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="all-levels">All Levels</option>
                      </Field>
                      <ErrorMessage name="level" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <Field 
                      id="price" 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      placeholder="0.00"
                      className={`w-full px-4 py-2 border ${touched.price && errors.price ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <ErrorMessage name="price" component="p" className="mt-1 text-sm text-red-600" />
                    <p className="mt-1 text-xs text-gray-500">Set to 0 for a free course</p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <Field
                      id="tags"
                      name="tags"
                      type="text"
                      placeholder="react, javascript, web development"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Help students find your course with relevant tags</p>
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Objectives (one per line)
                    </label>
                    <Field 
                      as="textarea" 
                      id="objectives" 
                      name="objectives" 
                      rows="4" 
                      placeholder="Build modern web applications&#10;Understand React hooks&#10;Deploy to production"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">What will students learn from this course?</p>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 mb-2">
                      Prerequisites (one per line)
                    </label>
                    <Field 
                      as="textarea" 
                      id="prerequisites" 
                      name="prerequisites" 
                      rows="3" 
                      placeholder="Basic JavaScript knowledge&#10;Understanding of HTML/CSS"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">What should students know before taking this course?</p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />} loading={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditCourse;
