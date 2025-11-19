import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import { FullPageLoader } from '../common/Loader';
import toast from 'react-hot-toast';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  price: Yup.number().required('Price is required'),
});

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [course, setCourse] = React.useState(null);

  React.useEffect(() => {
    // TODO: Fetch course data
    setLoading(false);
  }, [id]);

  if (loading) return <FullPageLoader />;

  const initialValues = {
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    price: course?.price || 0,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // TODO: Call API to update course
      toast.success('Course updated successfully!');
      navigate(`/courses/${id}`);
    } catch (error) {
      toast.error('Failed to update course');
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

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-6">
              <Card>
                <div className="p-6 space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg`}
                    />
                    <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Field as="textarea" id="description" name="description" rows="5" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <Field as="select" id="category" name="category" className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="programming">Programming</option>
                        <option value="design">Design</option>
                      </Field>
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <Field id="price" name="price" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={<FaSave />} loading={isSubmitting}>
                  Save Changes
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
