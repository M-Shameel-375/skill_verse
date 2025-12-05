// ============================================
// BECOME EDUCATOR PAGE
// ============================================
// Page for users to apply to become educators

import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Users,
  DollarSign,
  Award,
  Video,
  CheckCircle,
  ArrowRight,
  Upload,
  FileText,
  Briefcase,
  Star,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { applyAsEducator } from '@/api/userApi';
import toast from 'react-hot-toast';

const BecomeEducator = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    expertise: '',
    experience: '',
    bio: '',
    linkedIn: '',
    portfolio: '',
    sampleContent: '',
    motivation: '',
    teachingStyle: '',
    availability: '',
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await applyAsEducator(formData);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Earn Revenue',
      description: 'Keep up to 70% of your course sales and receive monthly payouts.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Reach Millions',
      description: 'Access our global community of eager learners from around the world.',
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Live Sessions',
      description: 'Host interactive live teaching sessions and connect with students in real-time.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Build Your Brand',
      description: 'Establish yourself as an expert and grow your professional reputation.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Analytics & Insights',
      description: 'Track your performance with detailed analytics and learner feedback.',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Impact',
      description: 'Make a difference by sharing your knowledge with learners worldwide.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Apply',
      description: 'Fill out the application form with your expertise and experience.',
    },
    {
      number: '02',
      title: 'Review',
      description: 'Our team reviews your application within 3-5 business days.',
    },
    {
      number: '03',
      title: 'Onboard',
      description: 'Complete onboarding with access to creator tools and resources.',
    },
    {
      number: '04',
      title: 'Create & Earn',
      description: 'Start creating courses and earning from your expertise.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Educators' },
    { value: '$10M+', label: 'Paid to Educators' },
    { value: '2M+', label: 'Students Taught' },
    { value: '4.8', label: 'Average Rating' },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to become an educator at SkillVerse. We'll
              review your application and get back to you within 3-5 business
              days.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              Join Our Educator Community
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Share Your Knowledge,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Impact Lives
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Become a SkillVerse educator and transform your expertise into
              income while helping millions of learners achieve their goals.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-lg"
              >
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Teach on SkillVerse?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of educators who have transformed their careers by
              sharing their knowledge on our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Getting started as an educator is simple. Follow these four easy
              steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-purple-700/30 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-purple-200">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 w-8 h-8 text-purple-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-4" id="apply">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apply to Become an Educator
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below to start your journey as a SkillVerse
              educator.
            </p>
          </div>

          {!isSignedIn ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <GraduationCap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Sign In to Apply
              </h3>
              <p className="text-gray-600 mb-6">
                You need to be signed in to apply as an educator.
              </p>
              <button
                onClick={() => navigate('/sign-in')}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="space-y-6">
                {/* Expertise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Area of Expertise *
                  </label>
                  <select
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select your primary expertise</option>
                    <option value="programming">Programming & Development</option>
                    <option value="design">Design & Creative</option>
                    <option value="business">Business & Marketing</option>
                    <option value="data-science">Data Science & AI</option>
                    <option value="languages">Languages</option>
                    <option value="music">Music & Arts</option>
                    <option value="health">Health & Fitness</option>
                    <option value="photography">Photography & Video</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Star className="w-4 h-4 inline mr-2" />
                    Years of Experience *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Professional Bio *
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Tell us about your professional background, achievements, and what makes you qualified to teach..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Teaching Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Teaching Style *
                  </label>
                  <textarea
                    name="teachingStyle"
                    value={formData.teachingStyle}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Describe your teaching approach and how you engage with students..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to teach on SkillVerse? *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Share your motivation for becoming an educator on our platform..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Portfolio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability *
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">How many hours per week can you dedicate?</option>
                    <option value="part-time-light">5-10 hours/week</option>
                    <option value="part-time">10-20 hours/week</option>
                    <option value="full-time">20+ hours/week</option>
                  </select>
                </div>

                {/* Sample Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Sample Content Link
                  </label>
                  <input
                    type="url"
                    name="sampleContent"
                    value={formData.sampleContent}
                    onChange={handleInputChange}
                    placeholder="Link to a video, article, or any content showcasing your teaching"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Share a YouTube video, blog post, or any content
                    that demonstrates your teaching ability.
                  </p>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="agreeToTerms"
                    className="ml-3 text-sm text-gray-600"
                  >
                    I agree to the{' '}
                    <a href="/terms" className="text-purple-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-purple-600 hover:underline">
                      Educator Agreement
                    </a>
                    . I understand that my application will be reviewed and I may
                    be contacted for additional information.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.agreeToTerms}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                question: 'How much can I earn as an educator?',
                answer:
                  'Earnings vary based on course popularity and pricing. Top educators earn $10,000+ monthly. You keep 70% of your course sales.',
              },
              {
                question: 'What equipment do I need?',
                answer:
                  'A good quality microphone, webcam, and stable internet connection are recommended. We provide guidelines and resources to help you get started.',
              },
              {
                question: 'How long does the review process take?',
                answer:
                  'We typically review applications within 3-5 business days. You\'ll receive an email with our decision and next steps.',
              },
              {
                question: 'Can I teach in languages other than English?',
                answer:
                  'Yes! We support educators teaching in multiple languages. Just specify your teaching language in your application.',
              },
              {
                question: 'Do I need prior teaching experience?',
                answer:
                  'While prior teaching experience is helpful, it\'s not required. What matters most is your expertise and ability to communicate effectively.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeEducator;
