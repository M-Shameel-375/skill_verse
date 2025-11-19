import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').min(5, 'Min 5 characters'),
  description: Yup.string().required('Description is required'),
  timeLimit: Yup.number().required('Time limit is required').min(1, 'Min 1 minute'),
  passingScore: Yup.number().required('Passing score is required').min(0).max(100),
  questions: Yup.array().min(1, 'At least one question required'),
});

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const initialValues = {
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 60,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
      },
    ],
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      toast.success('Quiz created successfully!');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      toast.error('Failed to create quiz');
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Quiz</h1>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, touched, errors, values }) => (
            <Form className="space-y-6">
              <Card>
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Quiz Information</h2>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Quiz Title *
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., React Basics Quiz"
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
                      rows="3"
                      className={`w-full px-4 py-2 border ${touched.description && errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="Describe what this quiz covers"
                    />
                    <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit (minutes) *
                      </label>
                      <Field
                        id="timeLimit"
                        name="timeLimit"
                        type="number"
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-2">
                        Passing Score (%) *
                      </label>
                      <Field
                        id="passingScore"
                        name="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Questions</h2>

                  <FieldArray name="questions">
                    {({ push, remove }) => (
                      <div className="space-y-6">
                        {values.questions.map((q, qIndex) => (
                          <div key={qIndex} className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold text-gray-900">Question {qIndex + 1}</h3>
                              {values.questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(qIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                              <Field
                                name={`questions.${qIndex}.question`}
                                as="textarea"
                                rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter question text"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">Options</label>
                              {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-3">
                                  <Field
                                    name={`questions.${qIndex}.correctAnswer`}
                                    type="radio"
                                    value={oIndex}
                                    className="w-4 h-4"
                                  />
                                  <Field
                                    name={`questions.${qIndex}.options.${oIndex}`}
                                    type="text"
                                    placeholder={`Option ${oIndex + 1}`}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            push({
                              question: '',
                              options: ['', '', '', ''],
                              correctAnswer: 0,
                            })
                          }
                        >
                          Add Question
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={<FaSave />} loading={isSubmitting}>
                  Create Quiz
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateQuiz;
