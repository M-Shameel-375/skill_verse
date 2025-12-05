import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaBook, FaRoad, FaSpinner, FaChevronRight, FaStar, FaUsers, FaClock, FaCheckCircle, FaRobot } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  getSkillRecommendations, 
  getCourseRecommendations, 
  getLearningPathRecommendation,
  getAIStatus 
} from '../../../api/aiApi';

const AIRecommendations = () => {
  const [activeTab, setActiveTab] = useState('skills');
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAIStatus] = useState(null);
  const [skillRecommendations, setSkillRecommendations] = useState([]);
  const [courseRecommendations, setCourseRecommendations] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('Web Development');

  const goalOptions = [
    'Web Development',
    'Data Science',
    'Mobile Development',
    'Cloud Computing',
  ];

  useEffect(() => {
    checkAIStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'skills' && skillRecommendations.length === 0) {
      fetchSkillRecommendations();
    } else if (activeTab === 'courses' && courseRecommendations.length === 0) {
      fetchCourseRecommendations();
    } else if (activeTab === 'path' && !learningPath) {
      fetchLearningPath();
    }
  }, [activeTab]);

  const checkAIStatus = async () => {
    try {
      const response = await getAIStatus();
      setAIStatus(response.data?.data || response.data);
    } catch (error) {
      console.error('Error checking AI status:', error);
    }
  };

  const fetchSkillRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getSkillRecommendations();
      const data = response.data?.data || response.data;
      setSkillRecommendations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching skill recommendations:', error);
      toast.error('Failed to fetch skill recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getCourseRecommendations();
      const data = response.data?.data || response.data;
      setCourseRecommendations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching course recommendations:', error);
      toast.error('Failed to fetch course recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPath = async (goal = selectedGoal) => {
    try {
      setLoading(true);
      const response = await getLearningPathRecommendation(goal);
      const data = response.data?.data || response.data;
      setLearningPath(data);
    } catch (error) {
      console.error('Error fetching learning path:', error);
      toast.error('Failed to fetch learning path');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (goal) => {
    setSelectedGoal(goal);
    setLearningPath(null);
    fetchLearningPath(goal);
  };

  const tabs = [
    { id: 'skills', label: 'Skill Recommendations', icon: FaLightbulb },
    { id: 'courses', label: 'Course Recommendations', icon: FaBook },
    { id: 'path', label: 'Learning Path', icon: FaRoad },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <FaRobot className="text-white text-2xl" />
          <div>
            <h2 className="text-xl font-bold text-white">AI Recommendations</h2>
            <p className="text-purple-100 text-sm">Personalized suggestions powered by AI</p>
          </div>
        </div>
      </div>

      {/* AI Status Banner */}
      {aiStatus && !aiStatus.available && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-6 py-3">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <span className="font-medium">Note:</span> AI features are using fallback recommendations. 
            Configure OpenAI API key for enhanced AI-powered suggestions.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Generating recommendations...</p>
          </div>
        ) : (
          <>
            {/* Skill Recommendations */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Based on your profile and learning history, we recommend these skills:
                </p>
                {skillRecommendations.length > 0 ? (
                  <div className="grid gap-4">
                    {skillRecommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{rec.skill}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{rec.reason}</p>
                        </div>
                        <Link
                          to={`/courses?search=${encodeURIComponent(rec.skill)}`}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium"
                        >
                          Find Courses <FaChevronRight className="text-xs" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaLightbulb className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No skill recommendations available yet.</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                      Complete your profile to get personalized recommendations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Course Recommendations */}
            {activeTab === 'courses' && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Courses selected based on your interests and learning goals:
                </p>
                {courseRecommendations.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {courseRecommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-video bg-gradient-to-br from-purple-500 to-indigo-600 relative">
                          {rec.course?.thumbnail ? (
                            <img
                              src={rec.course.thumbnail}
                              alt={rec.course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaBook className="text-white text-4xl opacity-50" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {rec.matchScore}% Match
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {rec.course?.title}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                            {rec.course?.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FaStar className="text-yellow-400" />
                              {rec.course?.rating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaUsers />
                              {rec.course?.enrolledCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock />
                              {rec.course?.duration || 'N/A'}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {rec.reasons?.slice(0, 2).map((reason, i) => (
                              <span
                                key={i}
                                className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                          <Link
                            to={`/courses/${rec.course?._id}`}
                            className="mt-4 block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
                          >
                            View Course
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaBook className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No course recommendations available yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Learning Path */}
            {activeTab === 'path' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-300">
                    Your personalized learning roadmap:
                  </p>
                  <select
                    value={selectedGoal}
                    onChange={(e) => handleGoalChange(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
                  >
                    {goalOptions.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                </div>

                {learningPath ? (
                  <>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {learningPath.targetSkill} Path
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Estimated time: {learningPath.estimatedTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {learningPath.learningPath?.filter(s => s.completed).length || 0}/
                            {learningPath.learningPath?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                      {/* Steps */}
                      <div className="space-y-6">
                        {learningPath.learningPath?.map((step, index) => (
                          <div key={index} className="relative flex items-start gap-4">
                            {/* Timeline dot */}
                            <div
                              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.completed
                                  ? 'bg-green-500 text-white'
                                  : step.current
                                  ? 'bg-purple-600 text-white ring-4 ring-purple-200 dark:ring-purple-800'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {step.completed ? (
                                <FaCheckCircle />
                              ) : (
                                <span className="font-bold">{step.step}</span>
                              )}
                            </div>

                            {/* Content */}
                            <div
                              className={`flex-1 p-4 rounded-lg ${
                                step.current
                                  ? 'bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700'
                                  : 'bg-gray-50 dark:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {step.skill}
                                  </h4>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {step.description}
                                  </p>
                                  <span
                                    className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                                      step.level === 'beginner'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : step.level === 'intermediate'
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                    }`}
                                  >
                                    {step.level}
                                  </span>
                                </div>
                                {step.current && (
                                  <Link
                                    to={`/courses?search=${encodeURIComponent(step.skill)}`}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Start Learning
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended courses for current step */}
                    {learningPath.recommendedCourses?.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                          Recommended Courses for Your Current Step
                        </h4>
                        <div className="grid gap-4 md:grid-cols-3">
                          {learningPath.recommendedCourses.map((course) => (
                            <Link
                              key={course._id}
                              to={`/courses/${course._id}`}
                              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                            >
                              <h5 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                {course.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <FaStar className="text-yellow-400" />
                                {course.rating?.toFixed(1) || 'N/A'}
                                <span className="mx-1">•</span>
                                {course.instructor?.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FaRoad className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Select a goal to see your learning path.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
