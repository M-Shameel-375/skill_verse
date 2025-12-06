import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    FaUpload,
    FaPlus,
    FaTrash,
    FaGripVertical,
    FaVideo,
    FaFile,
    FaImage,
    FaSave,
    FaEye,
    FaSpinner,
    FaCheck,
    FaTimes,
    FaArrowLeft,
    FaArrowRight,
} from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { createCourse, addLesson, addSection, publishCourse } from '@/api/courseApi';
import toast from 'react-hot-toast';

// ============================================
// CONSTANTS
// ============================================
const CATEGORIES = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'UI/UX Design',
    'Digital Marketing',
    'Business',
    'Other',
];

const LEVELS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all', label: 'All Levels' },
];

const STEPS = [
    { id: 1, title: 'Basic Info', description: 'Course title, description, and category' },
    { id: 2, title: 'Media', description: 'Thumbnail and preview video' },
    { id: 3, title: 'Curriculum', description: 'Add sections and lessons' },
    { id: 4, title: 'Pricing', description: 'Set your course price' },
    { id: 5, title: 'Review', description: 'Review and publish' },
];

// ============================================
// STEP INDICATOR COMPONENT
// ============================================
const StepIndicator = ({ steps, currentStep, onStepClick }) => (
    <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
                <button
                    onClick={() => onStepClick(step.id)}
                    disabled={step.id > currentStep + 1}
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${step.id === currentStep
                            ? 'bg-blue-600 text-white'
                            : step.id < currentStep
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                        } ${step.id <= currentStep + 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                >
                    {step.id < currentStep ? <FaCheck className="h-4 w-4" /> : step.id}
                </button>
                <div className="hidden md:block ml-3">
                    <p className={`text-sm font-medium ${step.id === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.title}
                    </p>
                </div>
                {index < steps.length - 1 && (
                    <div
                        className={`w-12 md:w-24 h-1 mx-2 rounded ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                    />
                )}
            </div>
        ))}
    </div>
);

// ============================================
// FILE UPLOAD COMPONENT
// ============================================
const FileUpload = ({ label, accept, onChange, preview, onRemove, icon: Icon }) => (
    <div>
        <Label>{label}</Label>
        <div className="mt-2">
            {preview ? (
                <div className="relative">
                    {accept.includes('image') ? (
                        <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    ) : (
                        <video src={preview} controls className="w-full h-48 rounded-lg" />
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Icon className="text-4xl text-gray-400 mb-2" />
                    <span className="text-gray-600">Click to upload</span>
                    <span className="text-xs text-gray-400 mt-1">{accept}</span>
                    <input type="file" accept={accept} onChange={onChange} className="hidden" />
                </label>
            )}
        </div>
    </div>
);

// ============================================
// LESSON FORM COMPONENT
// ============================================
const LessonForm = ({ lesson, index, onUpdate, onRemove }) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
            <FaGripVertical className="text-gray-400 mt-3 cursor-move" />
            <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                        placeholder="Lesson title"
                        value={lesson.title}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                    />
                    <select
                        value={lesson.type}
                        onChange={(e) => onUpdate(index, 'type', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="video">Video</option>
                        <option value="article">Article</option>
                        <option value="quiz">Quiz</option>
                    </select>
                </div>
                <textarea
                    placeholder="Lesson description (optional)"
                    value={lesson.description || ''}
                    onChange={(e) => onUpdate(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                />
                {lesson.type === 'video' && (
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => onUpdate(index, 'videoFile', e.target.files[0])}
                            className="hidden"
                            id={`video-${index}`}
                        />
                        <label
                            htmlFor={`video-${index}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                            <FaVideo className="text-blue-600" />
                            {lesson.videoFile ? lesson.videoFile.name : 'Upload Video'}
                        </label>
                        <Input
                            placeholder="Or enter video URL"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => onUpdate(index, 'videoUrl', e.target.value)}
                            className="flex-1"
                        />
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={lesson.isFree || false}
                            onChange={(e) => onUpdate(index, 'isFree', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Free preview</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={lesson.duration || ''}
                        onChange={(e) => onUpdate(index, 'duration', e.target.value)}
                        className="w-32"
                    />
                </div>
            </div>
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
                <FaTrash className="h-4 w-4" />
            </button>
        </div>
    </div>
);

// ============================================
// SECTION FORM COMPONENT
// ============================================
const SectionForm = ({ section, sectionIndex, onUpdate, onRemove, onAddLesson, onUpdateLesson, onRemoveLesson }) => (
    <Card className="mb-6">
        <CardHeader className="bg-gray-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FaGripVertical className="text-gray-400 cursor-move" />
                    <Input
                        placeholder="Section title (e.g., Introduction)"
                        value={section.title}
                        onChange={(e) => onUpdate(sectionIndex, 'title', e.target.value)}
                        className="w-64"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(sectionIndex)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                    <FaTrash className="h-4 w-4" />
                </button>
            </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
            {section.lessons.map((lesson, lessonIndex) => (
                <LessonForm
                    key={lessonIndex}
                    lesson={lesson}
                    index={lessonIndex}
                    onUpdate={(idx, field, value) => onUpdateLesson(sectionIndex, idx, field, value)}
                    onRemove={(idx) => onRemoveLesson(sectionIndex, idx)}
                />
            ))}
            <button
                type="button"
                onClick={() => onAddLesson(sectionIndex)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
                <FaPlus className="h-4 w-4" /> Add Lesson
            </button>
        </CardContent>
    </Card>
);

// ============================================
// CREATE COURSE COMPONENT
// ============================================
const CreateCourse = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    // Form state
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        language: 'English',
        tags: [],
        requirements: [''],
        whatYouWillLearn: [''],
    });

    const [mediaData, setMediaData] = useState({
        thumbnail: null,
        thumbnailPreview: null,
        previewVideo: null,
        previewVideoPreview: null,
    });

    const [sections, setSections] = useState([
        {
            title: 'Getting Started',
            lessons: [{ title: '', type: 'video', description: '', duration: '', isFree: true }],
        },
    ]);

    const [pricingData, setPricingData] = useState({
        price: 0,
        isFree: false,
        discount: 0,
        discountEndDate: '',
    });

    const [createdCourseId, setCreatedCourseId] = useState(null);

    // ============================================
    // HANDLERS
    // ============================================

    const handleCourseDataChange = (field, value) => {
        setCourseData((prev) => ({ ...prev, [field]: value }));
    };

    const handleArrayFieldChange = (field, index, value) => {
        setCourseData((prev) => {
            const newArray = [...prev[field]];
            newArray[index] = value;
            return { ...prev, [field]: newArray };
        });
    };

    const addArrayField = (field) => {
        setCourseData((prev) => ({
            ...prev,
            [field]: [...prev[field], ''],
        }));
    };

    const removeArrayField = (field, index) => {
        setCourseData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Thumbnail must be less than 5MB');
                return;
            }
            setMediaData((prev) => ({
                ...prev,
                thumbnail: file,
                thumbnailPreview: URL.createObjectURL(file),
            }));
        }
    };

    const handlePreviewVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                toast.error('Preview video must be less than 100MB');
                return;
            }
            setMediaData((prev) => ({
                ...prev,
                previewVideo: file,
                previewVideoPreview: URL.createObjectURL(file),
            }));
        }
    };

    // Section & Lesson handlers
    const addSection = () => {
        setSections((prev) => [
            ...prev,
            {
                title: '',
                lessons: [{ title: '', type: 'video', description: '', duration: '', isFree: false }],
            },
        ]);
    };

    const updateSection = (sectionIndex, field, value) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value };
            return newSections;
        });
    };

    const removeSection = (sectionIndex) => {
        if (sections.length === 1) {
            toast.error('You need at least one section');
            return;
        }
        setSections((prev) => prev.filter((_, i) => i !== sectionIndex));
    };

    const addLesson = (sectionIndex) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[sectionIndex].lessons.push({
                title: '',
                type: 'video',
                description: '',
                duration: '',
                isFree: false,
            });
            return newSections;
        });
    };

    const updateLesson = (sectionIndex, lessonIndex, field, value) => {
        setSections((prev) => {
            const newSections = [...prev];
            newSections[sectionIndex].lessons[lessonIndex] = {
                ...newSections[sectionIndex].lessons[lessonIndex],
                [field]: value,
            };
            return newSections;
        });
    };

    const removeLesson = (sectionIndex, lessonIndex) => {
        setSections((prev) => {
            const newSections = [...prev];
            if (newSections[sectionIndex].lessons.length === 1) {
                toast.error('Each section needs at least one lesson');
                return prev;
            }
            newSections[sectionIndex].lessons = newSections[sectionIndex].lessons.filter(
                (_, i) => i !== lessonIndex
            );
            return newSections;
        });
    };

    // Navigation
    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                if (!courseData.title.trim()) {
                    toast.error('Please enter a course title');
                    return false;
                }
                if (!courseData.description.trim()) {
                    toast.error('Please enter a course description');
                    return false;
                }
                if (!courseData.category) {
                    toast.error('Please select a category');
                    return false;
                }
                return true;
            case 2:
                if (!mediaData.thumbnail) {
                    toast.error('Please upload a course thumbnail');
                    return false;
                }
                return true;
            case 3:
                const hasValidLessons = sections.every(
                    (section) =>
                        section.title.trim() && section.lessons.every((lesson) => lesson.title.trim())
                );
                if (!hasValidLessons) {
                    toast.error('Please fill in all section and lesson titles');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    // Save as draft
    const saveDraft = async () => {
        try {
            setSaving(true);

            const formData = new FormData();
            formData.append('title', courseData.title);
            formData.append('description', courseData.description);
            formData.append('category', courseData.category);
            formData.append('level', courseData.level);
            formData.append('language', courseData.language);
            formData.append('status', 'draft');
            formData.append('price', pricingData.isFree ? 0 : pricingData.price);
            formData.append('isFree', pricingData.isFree);

            if (courseData.tags.length > 0) {
                formData.append('tags', JSON.stringify(courseData.tags));
            }
            if (courseData.requirements.filter((r) => r.trim()).length > 0) {
                formData.append('requirements', JSON.stringify(courseData.requirements.filter((r) => r.trim())));
            }
            if (courseData.whatYouWillLearn.filter((w) => w.trim()).length > 0) {
                formData.append('whatYouWillLearn', JSON.stringify(courseData.whatYouWillLearn.filter((w) => w.trim())));
            }

            if (mediaData.thumbnail) {
                formData.append('thumbnail', mediaData.thumbnail);
            }
            if (mediaData.previewVideo) {
                formData.append('previewVideo', mediaData.previewVideo);
            }

            formData.append('curriculum', JSON.stringify(sections));

            const response = await createCourse(formData);
            const courseId = response.data?.data?._id || response.data?._id;
            setCreatedCourseId(courseId);

            toast.success('Course saved as draft!');
            return courseId;
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error(error.message || 'Failed to save course');
            return null;
        } finally {
            setSaving(false);
        }
    };

    // Publish course
    const handlePublish = async () => {
        try {
            setPublishing(true);

            let courseId = createdCourseId;

            // Save first if not saved
            if (!courseId) {
                courseId = await saveDraft();
                if (!courseId) return;
            }

            await publishCourse(courseId);
            toast.success('Course published successfully!');
            navigate('/educator/courses');
        } catch (error) {
            console.error('Error publishing course:', error);
            toast.error(error.message || 'Failed to publish course');
        } finally {
            setPublishing(false);
        }
    };

    // ============================================
    // RENDER STEPS
    // ============================================

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="title">Course Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Complete React Developer Course 2024"
                                value={courseData.title}
                                onChange={(e) => handleCourseDataChange('title', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Course Description *</Label>
                            <textarea
                                id="description"
                                placeholder="Describe what students will learn in this course..."
                                value={courseData.description}
                                onChange={(e) => handleCourseDataChange('description', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <select
                                    id="category"
                                    value={courseData.category}
                                    onChange={(e) => handleCourseDataChange('category', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="level">Level</Label>
                                <select
                                    id="level"
                                    value={courseData.level}
                                    onChange={(e) => handleCourseDataChange('level', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {LEVELS.map((level) => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* What You'll Learn */}
                        <div>
                            <Label>What Students Will Learn</Label>
                            <div className="space-y-2 mt-2">
                                {courseData.whatYouWillLearn.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="e.g., Build real-world React applications"
                                            value={item}
                                            onChange={(e) => handleArrayFieldChange('whatYouWillLearn', index, e.target.value)}
                                        />
                                        {courseData.whatYouWillLearn.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayField('whatYouWillLearn', index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayField('whatYouWillLearn')}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                >
                                    <FaPlus className="h-3 w-3" /> Add more
                                </button>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div>
                            <Label>Requirements</Label>
                            <div className="space-y-2 mt-2">
                                {courseData.requirements.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="e.g., Basic JavaScript knowledge"
                                            value={item}
                                            onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                                        />
                                        {courseData.requirements.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayField('requirements', index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayField('requirements')}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                >
                                    <FaPlus className="h-3 w-3" /> Add more
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUpload
                                label="Course Thumbnail *"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                preview={mediaData.thumbnailPreview}
                                onRemove={() => setMediaData((prev) => ({ ...prev, thumbnail: null, thumbnailPreview: null }))}
                                icon={FaImage}
                            />

                            <FileUpload
                                label="Preview Video (Optional)"
                                accept="video/*"
                                onChange={handlePreviewVideoChange}
                                preview={mediaData.previewVideoPreview}
                                onRemove={() =>
                                    setMediaData((prev) => ({ ...prev, previewVideo: null, previewVideoPreview: null }))
                                }
                                icon={FaVideo}
                            />
                        </div>

                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better engagement</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Use a high-quality thumbnail (1280x720 recommended)</li>
                                    <li>• Preview video should be 1-3 minutes long</li>
                                    <li>• Showcase what students will learn</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <p className="text-gray-600">
                            Organize your course content into sections and lessons. Drag to reorder.
                        </p>

                        {sections.map((section, sectionIndex) => (
                            <SectionForm
                                key={sectionIndex}
                                section={section}
                                sectionIndex={sectionIndex}
                                onUpdate={updateSection}
                                onRemove={removeSection}
                                onAddLesson={addLesson}
                                onUpdateLesson={updateLesson}
                                onRemoveLesson={removeLesson}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={addSection}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <FaPlus /> Add New Section
                        </button>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={pricingData.isFree}
                                    onChange={(e) =>
                                        setPricingData((prev) => ({ ...prev, isFree: e.target.checked, price: e.target.checked ? 0 : prev.price }))
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-medium">This is a free course</span>
                            </label>
                        </div>

                        {!pricingData.isFree && (
                            <>
                                <div>
                                    <Label htmlFor="price">Course Price (USD) *</Label>
                                    <div className="relative mt-2">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="49.99"
                                            value={pricingData.price}
                                            onChange={(e) => setPricingData((prev) => ({ ...prev, price: e.target.value }))}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="discount">Discount (%)</Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        value={pricingData.discount}
                                        onChange={(e) => setPricingData((prev) => ({ ...prev, discount: e.target.value }))}
                                    />
                                </div>

                                {pricingData.discount > 0 && (
                                    <div>
                                        <Label htmlFor="discountEnd">Discount End Date</Label>
                                        <Input
                                            id="discountEnd"
                                            type="date"
                                            value={pricingData.discountEndDate}
                                            onChange={(e) => setPricingData((prev) => ({ ...prev, discountEndDate: e.target.value }))}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900">Review Your Course</h3>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex gap-6">
                                    {mediaData.thumbnailPreview && (
                                        <img
                                            src={mediaData.thumbnailPreview}
                                            alt="Thumbnail"
                                            className="w-48 h-28 object-cover rounded-lg"
                                        />
                                    )}
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{courseData.title}</h4>
                                        <p className="text-gray-600 mt-1">
                                            {courseData.category} • {courseData.level}
                                        </p>
                                        <p className="text-2xl font-bold text-green-600 mt-2">
                                            {pricingData.isFree ? 'Free' : `$${pricingData.price}`}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Curriculum Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    {sections.length} sections •{' '}
                                    {sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
                                </p>
                                <ul className="mt-3 space-y-2">
                                    {sections.map((section, idx) => (
                                        <li key={idx} className="text-gray-700">
                                            <span className="font-medium">{section.title || `Section ${idx + 1}`}</span>
                                            <span className="text-gray-500"> - {section.lessons.length} lessons</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-yellow-50 border-yellow-200">
                            <CardContent className="p-4">
                                <h4 className="font-medium text-yellow-900 mb-2">⚠️ Before Publishing</h4>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                    <li>• Make sure all lesson videos are uploaded</li>
                                    <li>• Review all content for accuracy</li>
                                    <li>• Once published, students can enroll immediately</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Helmet>
                <title>Create Course | SkillVerse</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/educator')}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
                        >
                            <FaArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                        <p className="text-gray-600 mt-1">Share your knowledge with the world</p>
                    </div>

                    {/* Step Indicator */}
                    <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

                    {/* Form Content */}
                    <Card>
                        <CardContent className="p-6">{renderStep()}</CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={currentStep === 1 ? 'invisible' : ''}
                        >
                            <FaArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={saveDraft} disabled={saving}>
                                {saving ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2 h-4 w-4" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="mr-2 h-4 w-4" /> Save Draft
                                    </>
                                )}
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button onClick={nextStep}>
                                    Next <FaArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handlePublish} disabled={publishing} className="bg-green-600 hover:bg-green-700">
                                    {publishing ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2 h-4 w-4" /> Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck className="mr-2 h-4 w-4" /> Publish Course
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateCourse;