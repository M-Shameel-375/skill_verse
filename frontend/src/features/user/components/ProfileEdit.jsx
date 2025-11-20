import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  title: Yup.string().required('Title is required'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
  location: Yup.string(),
  website: Yup.string().url('Invalid URL'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string(),
});

const ProfileEdit = ({ profile, onSave }) => {
  const navigate = useNavigate();

  const initialValues = {
    name: profile?.name || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (onSave) {
        onSave(values);
      }
      toast.success('Profile updated successfully!');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, touched, errors, values }) => (
            <Form className="space-y-6">
              {/* Personal Info */}
              <Card>
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        className={`w-full px-4 py-2 border ${touched.name && errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      />
                      <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Title *
                      </label>
                      <Field
                        id="title"
                        name="title"
                        type="text"
                        placeholder="e.g., Full Stack Developer"
                        className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      />
                      <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <Field
                      as="textarea"
                      id="bio"
                      name="bio"
                      rows="4"
                      placeholder="Tell us about yourself\"\n                      className={`w-full px-4 py-2 border ${touched.bio && errors.bio ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}\n                    />\n                    <ErrorMessage name=\"bio\" component=\"p\" className=\"mt-1 text-sm text-red-600\" />\n                  </div>\n                </div>\n              </Card>\n\n              {/* Contact Info */}\n              <Card>\n                <div className=\"p-6 space-y-6\">\n                  <h2 className=\"text-xl font-bold text-gray-900\">Contact Information</h2>\n\n                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n                    <div>\n                      <label htmlFor=\"email\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Email *\n                      </label>\n                      <Field\n                        id=\"email\"\n                        name=\"email\"\n                        type=\"email\"\n                        className={`w-full px-4 py-2 border ${touched.email && errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}\n                      />\n                      <ErrorMessage name=\"email\" component=\"p\" className=\"mt-1 text-sm text-red-600\" />\n                    </div>\n\n                    <div>\n                      <label htmlFor=\"phone\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Phone\n                      </label>\n                      <Field\n                        id=\"phone\"\n                        name=\"phone\"\n                        type=\"tel\"\n                        className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                      />\n                    </div>\n                  </div>\n                </div>\n              </Card>\n\n              {/* Location & Website */}\n              <Card>\n                <div className=\"p-6 space-y-6\">\n                  <h2 className=\"text-xl font-bold text-gray-900\">Additional Information</h2>\n\n                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n                    <div>\n                      <label htmlFor=\"location\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Location\n                      </label>\n                      <Field\n                        id=\"location\"\n                        name=\"location\"\n                        type=\"text\"\n                        placeholder=\"City, Country\"\n                        className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"\n                      />\n                    </div>\n\n                    <div>\n                      <label htmlFor=\"website\" className=\"block text-sm font-medium text-gray-700 mb-2\">\n                        Website\n                      </label>\n                      <Field\n                        id=\"website\"\n                        name=\"website\"\n                        type=\"url\"\n                        placeholder=\"https://example.com\"\n                        className={`w-full px-4 py-2 border ${touched.website && errors.website ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}\n                      />\n                      <ErrorMessage name=\"website\" component=\"p\" className=\"mt-1 text-sm text-red-600\" />\n                    </div>\n                  </div>\n                </div>\n              </Card>\n\n              {/* Submit */}\n              <div className=\"flex justify-end gap-3\">\n                <Button variant=\"outline\" onClick={() => navigate(-1)}>\n                  Cancel\n                </Button>\n                <Button type=\"submit\" variant=\"primary\" icon={<FaSave />} loading={isSubmitting}>\n                  Save Changes\n                </Button>\n              </div>\n            </Form>\n          )}\n        </Formik>\n      </div>\n    </div>\n  );\n};\n\nexport default ProfileEdit;
