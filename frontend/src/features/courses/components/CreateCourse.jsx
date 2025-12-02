import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import { createCourse } from '../../../api/courseApi';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').min(5, 'Title must be at least 5 characters'),
  description: Yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  shortDescription: Yup.string().required('Short description is required').max(200, 'Max 200 characters'),
  category: Yup.string().required('Category is required'),
  level: Yup.string().required('Level is required'),
  price: Yup.number().required('Price is required').min(0, 'Price cannot be negative'),
  learningOutcomes: Yup.array().min(1, 'At least one learning outcome is required'),
  requirements: Yup.array(),
});

const CreateCourse = () => {const navigate = useNavigate();

  const initialValues = {
    title: '',
    description: '',
    shortDescription: '',
    category: 'programming',
    level: 'beginner',
    price: 0,
    originalPrice: 0,
    learningOutcomes: [''],
    requirements: [''],
    tags: '',
    language: 'en',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await createCourse(values);
      toast.success('Course created successfully!');
      navigate('/my-courses');
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}\n        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Course</h1>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors, values }) => (
            <Form className="space-y-6">
              {/* Basic Information */}
              <Card>
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., Complete React Masterclass"
                    />
                    <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description *
                    </label>
                    <Field
                      as="textarea"
                      id="shortDescription"
                      name="shortDescription"
                      rows="2"
                      className={`w-full px-4 py-2 border ${touched.shortDescription && errors.shortDescription ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="Brief description for course listing"
                    />
                    <ErrorMessage name="shortDescription" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description *
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows="5"
                      className={`w-full px-4 py-2 border ${touched.description && errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="Detailed course description"
                    />
                    <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>
              </Card>

              {/* Category & Level */}
              <Card>
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Course Details</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <Field as="select" id="category" name="category" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="programming">Programming</option>
                        <option value="design">Design</option>
                        <option value="business">Business</option>
                        <option value="language">Language</option>
                      </Field>
                    </div>

                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                        Level *
                      </label>
                      <Field as="select" id="level" name="level" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <Field
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        className={`w-full px-4 py-2 border ${touched.price && errors.price ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div>
                      <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price ($)
                      </label>
                      <Field
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Learning Outcomes */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Outcomes</h2>

                  <FieldArray name="learningOutcomes">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.learningOutcomes.map((_, index) => (
                          <div key={index} className="flex gap-2">
                            <Field
                              name={`learningOutcomes.${index}`}
                              as="textarea"
                              rows="2"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="What students will learn..."
                            />
                            <button type="button" onClick={() => remove(index)} className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                              Remove
                            </button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => push('')}>
                          Add Learning Outcome
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </Card>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={<FaSave />} loading={isSubmitting}>
                  Create Course
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateCourse;
