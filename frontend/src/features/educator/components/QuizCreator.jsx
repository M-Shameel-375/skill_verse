import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getMyCourses } from '../../../api/courseApi';
import { createQuiz } from '../../../api/quizApi';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  course: Yup.string().required('Course is required'),
  timeLimit: Yup.number().min(1, 'Time limit must be at least 1 minute'),
});

const QuizCreator = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getMyCourses();
        setCourses(response.data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await createQuiz(values);
      toast.success('Quiz created successfully!');
      navigate('/educator');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
      <Formik
        initialValues={{
          title: '',
          description: '',
          course: '',
          timeLimit: 30,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <Field name="title" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
              <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <Field as="textarea" name="description" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
              <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <Field as="select" name="course" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </Field>
              <ErrorMessage name="course" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
              <Field type="number" name="timeLimit" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
              <ErrorMessage name="timeLimit" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Create Quiz</Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default QuizCreator;
