import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import toast from 'react-hot-toast';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').min(10, 'Min 10 characters'),
  description: Yup.string().required('Description is required').min(20, 'Min 20 characters'),
  offering: Yup.string().required('Offering skill is required'),
  seeking: Yup.string().required('Seeking skill is required'),
  offeringDetails: Yup.string(),
  seekingDetails: Yup.string(),
  duration: Yup.string().required('Session duration is required'),
  availability: Yup.string().required('Availability is required'),
});

const CreateExchange = () => {
  const navigate = useNavigate();

  const skills = [
    'React',
    'Vue.js',
    'Angular',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'Python',
    'Java',
    'C++',
    'Go',
    'Rust',
    'SQL',
    'MongoDB',
    'UI/UX Design',
    'Graphic Design',
    'SEO',
    'Digital Marketing',
    'Content Writing',
  ];

  const initialValues = {
    title: '',
    description: '',
    offering: '',
    offeringDetails: '',
    seeking: '',
    seekingDetails: '',
    duration: '1-2',
    availability: 'weekends',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('Creating exchange:', values);
      toast.success('Exchange created successfully!');
      navigate('/skill-exchange');
    } catch (error) {
      toast.error('Failed to create exchange');
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Skill Exchange</h1>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, touched, errors, values }) => (
            <Form className="space-y-6">
              {/* Basic Info */}
              <Card>
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Exchange Information</h2>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., Learn React in exchange for Python tutoring"
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
                      placeholder="Describe what you can teach and what you want to learn"
                    />
                    <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>
              </Card>

              {/* Skills */}
              <Card>
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Skills to Exchange</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="offering" className="block text-sm font-medium text-gray-700 mb-2">
                        I can teach *
                      </label>
                      <Field
                        as="select"
                        id="offering"
                        name="offering"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a skill</option>
                        {skills.map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="offering" component="p" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="seeking" className="block text-sm font-medium text-gray-700 mb-2">
                        I want to learn *
                      </label>
                      <Field
                        as="select"
                        id="seeking"
                        name="seeking"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a skill</option>
                        {skills.map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="seeking" component="p" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="offeringDetails" className="block text-sm font-medium text-gray-700 mb-2">
                        What you can teach
                      </label>
                      <Field
                        as="textarea"
                        id="offeringDetails"
                        name="offeringDetails"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your expertise level and what topics you can cover"
                      />
                    </div>

                    <div>
                      <label htmlFor="seekingDetails" className="block text-sm font-medium text-gray-700 mb-2">
                        What you want to learn
                      </label>
                      <Field
                        as="textarea"
                        id="seekingDetails"
                        name="seekingDetails"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your learning goals and expectations"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Session Details */}
              <Card>
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Session Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Session Duration *
                      </label>
                      <Field
                        as="select"
                        id="duration"
                        name="duration"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1-2">1-2 hours</option>
                        <option value="2-3">2-3 hours</option>
                        <option value="3-4">3-4 hours</option>
                        <option value="flexible">Flexible</option>
                      </Field>
                    </div>

                    <div>
                      <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                        Availability *
                      </label>
                      <Field
                        as="select"
                        id="availability"
                        name="availability"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="weekdays">Weekdays</option>
                        <option value="weekends">Weekends</option>
                        <option value="flexible">Flexible</option>
                        <option value="evenings">Evenings</option>
                      </Field>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={<FaSave />} loading={isSubmitting}>
                  Create Exchange
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateExchange;
