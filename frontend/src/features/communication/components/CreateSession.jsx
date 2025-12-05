import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';
import { createLiveSession } from '../../../api/liveSessionApi';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').min(10, 'Min 10 characters'),
  description: Yup.string().required('Description is required').min(20, 'Min 20 characters'),
  category: Yup.string().required('Category is required'),
  difficulty: Yup.string().required('Difficulty is required'),
  startTime: Yup.string().required('Start time is required'),
  duration: Yup.number().required('Duration is required').min(30, 'Min 30 minutes'),
  maxParticipants: Yup.number().required('Max participants is required').min(5),
  location: Yup.string().required('Location is required'),
});

const CreateSession = () => {
  const navigate = useNavigate();

  const initialValues = {
    title: '',
    description: '',
    category: '',
    difficulty: 'Intermediate',
    startTime: '',
    duration: 60,
    maxParticipants: 50,
    location: 'Online',
    topics: '',
    prerequisites: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Transform comma-separated strings to arrays
      const sessionData = {
        ...values,
        topics: values.topics ? values.topics.split(',').map(t => t.trim()).filter(Boolean) : [],
        prerequisites: values.prerequisites ? values.prerequisites.split(',').map(p => p.trim()).filter(Boolean) : [],
      };
      
      await createLiveSession(sessionData);
      toast.success('Session created successfully!');
      navigate('/live-sessions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['React', 'JavaScript', 'Node.js', 'Python', 'Web Design', 'Vue.js', 'TypeScript', 'CSS'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Live Session</h1>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, touched, errors, values }) => (
            <Form className="space-y-6">
              {/* Basic Info */}
              <Card>
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Session Information</h2>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Session Title *
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., React Hooks Deep Dive"
                    />
                    <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows="4"
                      className={`w-full px-4 py-2 border ${touched.description && errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="Describe what participants will learn"
                    />
                    <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <Field
                        as="select"
                        id="category"
                        name="category"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >\n                        <option value=\"\">Select category</option>\n                        {categories.map((cat) => (\n                          <option key={cat} value={cat}>\n                            {cat}\n                          </option>\n                        ))}\n                      </Field>\n                      <ErrorMessage name=\"category\" component=\"p\" className=\"mt-1 text-sm text-red-600\" />\n                    </div>\n\n                    <div>\n                      <label htmlFor=\"difficulty\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Difficulty *\n                      </label>\n                      <Field\n                        as=\"select\"\n                        id=\"difficulty\"\n                        name=\"difficulty\"\n                        className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                      >\n                        <option value=\"Beginner\">Beginner</option>\n                        <option value=\"Intermediate\">Intermediate</option>\n                        <option value=\"Advanced\">Advanced</option>\n                      </Field>\n                    </div>\n                  </div>\n                </div>\n              </Card>\n\n              {/* Schedule */}\n              <Card>\n                <div className=\"p-6 space-y-6\">\n                  <h2 className=\"text-xl font-bold text-gray-900\">Schedule & Details</h2>\n\n                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n                    <div>\n                      <label htmlFor=\"startTime\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Start Date & Time *\n                      </label>\n                      <Field\n                        id=\"startTime\"\n                        name=\"startTime\"\n                        type=\"datetime-local\"\n                        className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                      />\n                      <ErrorMessage name=\"startTime\" component=\"p\" className=\"mt-1 text-sm text-red-600\" />\n                    </div>\n\n                    <div>\n                      <label htmlFor=\"duration\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Duration (minutes) *\n                      </label>\n                      <Field\n                        id=\"duration\"\n                        name=\"duration\"\n                        type=\"number\"\n                        min=\"30\"\n                        step=\"30\"\n                        className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                      />\n                      <ErrorMessage name=\"duration\" component=\"p\" className=\"mt-1 text-sm text-red-600\" />\n                    </div>\n                  </div>\n\n                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n                    <div>\n                      <label htmlFor=\"location\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Location *\n                      </label>\n                      <Field\n                        id=\"location\"\n                        name=\"location\"\n                        type=\"text\"\n                        className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                        placeholder=\"e.g., Online (Zoom)\"\n                      />\n                      <ErrorMessage name=\"location\" component=\"p\" className=\"mt-1 text-sm text-red-600\" />\n                    </div>\n\n                    <div>\n                      <label htmlFor=\"maxParticipants\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Max Participants *\n                      </label>\n                      <Field\n                        id=\"maxParticipants\"\n                        name=\"maxParticipants\"\n                        type=\"number\"\n                        min=\"5\"\n                        className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                      />\n                      <ErrorMessage name=\"maxParticipants\" component=\"p\" className=\"mt-1 text-sm text-red-600\" />\n                    </div>\n                  </div>\n                </div>\n              </Card>\n\n              {/* Content */}\n              <Card>\n                <div className=\"p-6 space-y-6\">\n                  <h2 className=\"text-xl font-bold text-gray-900\">Content</h2>\n\n                  <div>\n                    <label htmlFor=\"topics\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                      Topics (comma separated)\n                    </label>\n                    <Field\n                      as=\"textarea\"\n                      id=\"topics\"\n                      name=\"topics\"\n                      rows=\"3\"\n                      className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                      placeholder=\"e.g., useState, useEffect, Custom Hooks\"\n                    />\n                  </div>\n\n                  <div>\n                    <label htmlFor=\"prerequisites\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                      Prerequisites (comma separated)\n                    </label>\n                    <Field\n                      as=\"textarea\"\n                      id=\"prerequisites\"\n                      name=\"prerequisites\"\n                      rows=\"3\"\n                      className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                      placeholder=\"e.g., JavaScript Fundamentals, Basic React Knowledge\"\n                    />\n                  </div>\n                </div>\n              </Card>\n\n              {/* Submit */}\n              <div className=\"flex justify-end gap-3\">\n                <Button variant=\"outline\" onClick={() => navigate(-1)}>\n                  Cancel\n                </Button>\n                <Button type=\"submit\" variant=\"primary\" icon={<FaSave />} loading={isSubmitting}>\n                  Create Session\n                </Button>\n              </div>\n            </Form>\n          )}\n        </Formik>\n      </div>\n    </div>\n  );\n};\n\nexport default CreateSession;
