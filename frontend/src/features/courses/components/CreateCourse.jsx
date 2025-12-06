import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { 
  FaSave, 
  FaArrowLeft, 
  FaTrash, 
  FaPlus,
  FaImage,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createCourse } from '../../../api/courseApi';
import toast from 'react-hot-toast';

// ============================================
// VALIDATION SCHEMA
// ============================================
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  shortDescription: Yup.string()
    .required('Short description is required')
    .max(200, 'Max 200 characters'),
  category: Yup.string().required('Category is required'),
  level: Yup.string().required('Level is required'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price cannot be negative'),
  learningOutcomes: Yup.array()
    .of(Yup.string().min(1, 'Outcome cannot be empty'))
    .min(1, 'At least one learning outcome is required'),
  requirements: Yup.array().of(Yup.string()),
  language: Yup.string().required('Language is required'),
});

// ============================================
// CONSTANTS
// ============================================
const CATEGORIES = [
  { value: 'Programming', label: 'Programming' },
  { value: 'Design', label: 'Design' },
  { value: 'Business', label: 'Business' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Photography', label: 'Photography' },
  { value: 'Music', label: 'Music' },
  { value: 'Health & Fitness', label: 'Health & Fitness' },
  { value: 'Language', label: 'Language' },
  { value: 'Personal Development', label: 'Personal Development' },
  { value: 'Science', label: 'Science' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Art & Craft', label: 'Art & Craft' },
  { value: 'Cooking', label: 'Cooking' },
  { value: 'Other', label: 'Other' },
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all-levels', label: 'All Levels' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ur', label: 'Urdu' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
];

// ============================================
// MAIN COMPONENT
// ============================================
const CreateCourse = () => {
  const navigate = useNavigate();
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ============================================
  // INITIAL VALUES
  // ============================================
  const initialValues = {
    title: '',
    description: '',
    shortDescription: '',
    category: 'Programming',
    level: 'beginner',
    price: 0,
    originalPrice: 0,
    learningOutcomes: [''],
    requirements: [''],
    tags: '',
    language: 'en',
    targetAudience: [''],
    prerequisites: [''],
  };

  // ============================================
  // THUMBNAIL HANDLER
  // ============================================
  const handleThumbnailChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const removeThumbnail = useCallback(() => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  }, []);

  // ============================================
  // FORM SUBMISSION
  // ============================================
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setIsUploading(true);

      const cleanedValues = {
        ...values,
        learningOutcomes: values.learningOutcomes.filter(item => item.trim() !== ''),
        requirements: values.requirements.filter(item => item.trim() !== ''),
        targetAudience: values.targetAudience?.filter(item => item.trim() !== '') || [],
        prerequisites: values.prerequisites?.filter(item => item.trim() !== '') || [],
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };

      if (cleanedValues.learningOutcomes.length === 0) {
        setFieldError('learningOutcomes', 'At least one learning outcome is required');
        setSubmitting(false);
        setIsUploading(false);
        return;
      }

      let courseData;
      if (thumbnailFile) {
        courseData = new FormData();
        courseData.append('thumbnail', thumbnailFile);
        Object.keys(cleanedValues).forEach(key => {
          if (Array.isArray(cleanedValues[key])) {
            cleanedValues[key].forEach((item, index) => {
              courseData.append(`${key}[${index}]`, item);
            });
          } else {
            courseData.append(key, cleanedValues[key]);
          }
        });
      } else {
        courseData = cleanedValues;
      }

      const response = await createCourse(courseData, !!thumbnailFile);
      toast.success('Course created successfully!');
      navigate(`/educator/courses/${response.data?.data?._id || ''}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach(key => {
          setFieldError(key, error.response.data.errors[key].message);
        });
      }
    } finally {
      setSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Fill in the details below to create your course. You can add content after creation.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors, values }) => (
            <Form className="space-y-6">
              
              {/* Thumbnail Upload */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Thumbnail</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Upload an eye-catching thumbnail (recommended: 1280x720px). Optional - a placeholder will be used if not provided.
                  </p>
                  
                  {thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaImage className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WebP (Max 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  )}
                </div>
              </Card>

              {/* Basic Information */}
              <Card className="overflow-hidden">
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      className={`w-full px-4 py-3 border ${touched.title && errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                      placeholder="e.g., Complete React Masterclass 2024"
                    />
                    <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Short Description <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="textarea"
                      id="shortDescription"
                      name="shortDescription"
                      rows="2"
                      maxLength="200"
                      className={`w-full px-4 py-3 border ${touched.shortDescription && errors.shortDescription ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                      placeholder="Brief description for course listing (max 200 characters)"
                    />
                    <div className="flex justify-between mt-1">
                      <ErrorMessage name="shortDescription" component="p" className="text-sm text-red-600" />
                      <span className="text-xs text-gray-500">{values.shortDescription?.length || 0}/200</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Description <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows="6"
                      maxLength="2000"
                      className={`w-full px-4 py-3 border ${touched.description && errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                      placeholder="Detailed course description. Explain what students will learn, course structure, and why they should enroll."
                    />
                    <div className="flex justify-between mt-1">
                      <ErrorMessage name="description" component="p" className="text-sm text-red-600" />
                      <span className="text-xs text-gray-500">{values.description?.length || 0}/2000</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Course Details */}
              <Card className="overflow-hidden">
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <Field 
                        as="select" 
                        id="category" 
                        name="category" 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </Field>
                    </div>

                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Level <span className="text-red-500">*</span>
                      </label>
                      <Field 
                        as="select" 
                        id="level" 
                        name="level" 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {LEVELS.map(lvl => (
                          <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                        ))}
                      </Field>
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <Field 
                        as="select" 
                        id="language" 
                        name="language" 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </Field>
                    </div>

                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <Field
                        id="tags"
                        name="tags"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="react, javascript, web"
                      />
                      <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <Field
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          className={`w-full px-4 py-3 border ${touched.price && errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                        />
                        <ErrorMessage name="price" component="p" className="mt-1 text-sm text-red-600" />
                        <p className="mt-1 text-xs text-gray-500">Set to 0 for a free course</p>
                      </div>

                      <div>
                        <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Original Price ($)
                        </label>
                        <Field
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500">Shows as discount if higher than price</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Learning Outcomes */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Learning Outcomes <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">What will students learn?</p>

                  <FieldArray name="learningOutcomes">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.learningOutcomes.map((_, index) => (
                          <div key={index} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 rounded">
                              {index + 1}
                            </span>
                            <Field
                              name={`learningOutcomes.${index}`}
                              type="text"
                              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder="e.g., Build production-ready React applications"
                            />
                            {values.learningOutcomes.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => remove(index)} 
                                className="flex-shrink-0 p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        ))}
                        <ErrorMessage name="learningOutcomes" component="p" className="text-sm text-red-600" />
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <FaPlus /> Add Learning Outcome
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </Card>

              {/* Requirements */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Requirements</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">What do students need before starting?</p>

                  <FieldArray name="requirements">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.requirements.map((_, index) => (
                          <div key={index} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 rounded">
                              {index + 1}
                            </span>
                            <Field
                              name={`requirements.${index}`}
                              type="text"
                              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder="e.g., Basic knowledge of HTML and CSS"
                            />
                            {values.requirements.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => remove(index)} 
                                className="flex-shrink-0 p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <FaPlus /> Add Requirement
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </Card>

              {/* Target Audience */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Target Audience</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Who is this course for?</p>

                  <FieldArray name="targetAudience">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.targetAudience.map((_, index) => (
                          <div key={index} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 rounded">
                              {index + 1}
                            </span>
                            <Field
                              name={`targetAudience.${index}`}
                              type="text"
                              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder="e.g., Web developers looking to learn React"
                            />
                            {values.targetAudience.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => remove(index)} 
                                className="flex-shrink-0 p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <FaPlus /> Add Target Audience
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </Card>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isUploading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {(isSubmitting || isUploading) ? (
                    <><FaSpinner className="animate-spin mr-2" /> Creating...</>
                  ) : (
                    <><FaSave className="mr-2" /> Create Course</>
                  )}
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> After creating the course, you can add sections, lectures, 
                  videos, and other content. The course will be saved as a draft until you publish it.
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateCourse;
