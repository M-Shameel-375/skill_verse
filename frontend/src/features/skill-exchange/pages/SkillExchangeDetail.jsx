// ============================================
// SKILL EXCHANGE DETAIL PAGE
// ============================================
// Detailed view of a skill exchange

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageCircle,
  Video,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Paperclip,
  MoreVertical,
  ExternalLink,
  Award,
  TrendingUp,
  Users,
  Target,
  ChevronRight,
  Play,
  Pause,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { motion } from 'framer-motion';

const SkillExchangeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [exchange, setExchange] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setExchange({
        _id: id,
        title: 'React.js for Python Programming',
        description:
          'Looking to exchange my React.js expertise for Python programming skills. I can teach modern React with hooks, Redux, and Next.js. In return, I want to learn Python for data science and automation.',
        status: 'in-progress',
        matchScore: 92,
        requester: {
          _id: '1',
          name: 'Alex Johnson',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          rating: 4.8,
          completedExchanges: 12,
          skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
        },
        provider: {
          _id: '2',
          name: 'Sarah Chen',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          rating: 4.9,
          completedExchanges: 18,
          skills: ['Python', 'Data Science', 'Machine Learning', 'Django'],
        },
        offeredSkill: {
          name: 'React.js',
          level: 'advanced',
          description:
            'Modern React development with hooks, context, and state management',
        },
        requestedSkill: {
          name: 'Python',
          level: 'intermediate',
          description:
            'Python for data science, automation, and backend development',
        },
        objectives: [
          'Master Python fundamentals',
          'Learn data manipulation with Pandas',
          'Build automation scripts',
          'Introduction to Machine Learning',
        ],
        progress: {
          requesterProgress: 45,
          providerProgress: 52,
          overallProgress: 48,
        },
        sessions: [
          {
            sessionNumber: 1,
            scheduledAt: new Date('2024-12-01T10:00:00'),
            status: 'completed',
            topic: 'Python Basics & Setup',
            duration: 60,
          },
          {
            sessionNumber: 2,
            scheduledAt: new Date('2024-12-03T10:00:00'),
            status: 'completed',
            topic: 'React Components & Props',
            duration: 55,
          },
          {
            sessionNumber: 3,
            scheduledAt: new Date('2024-12-05T10:00:00'),
            status: 'scheduled',
            topic: 'Data Types & Functions',
            duration: 60,
          },
        ],
        milestones: [
          {
            title: 'Python Environment Setup',
            status: 'completed',
            completedAt: new Date('2024-12-01'),
          },
          {
            title: 'Basic Syntax & Data Types',
            status: 'completed',
            completedAt: new Date('2024-12-02'),
          },
          {
            title: 'Functions & Modules',
            status: 'in-progress',
            targetDate: new Date('2024-12-08'),
          },
          {
            title: 'Object-Oriented Python',
            status: 'pending',
            targetDate: new Date('2024-12-15'),
          },
        ],
        messages: [
          {
            _id: '1',
            sender: { _id: '1', name: 'Alex Johnson' },
            message: 'Hey! Ready for our next session?',
            createdAt: new Date('2024-12-03T09:30:00'),
          },
          {
            _id: '2',
            sender: { _id: '2', name: 'Sarah Chen' },
            message:
              'Yes! I prepared some exercises for React hooks. Also, here are the resources for our Python session.',
            createdAt: new Date('2024-12-03T09:32:00'),
          },
        ],
        sharedResources: [
          {
            title: 'Python Crash Course PDF',
            type: 'document',
            sharedBy: { name: 'Sarah Chen' },
            uploadedAt: new Date('2024-12-01'),
          },
          {
            title: 'React Official Tutorial',
            type: 'link',
            url: 'https://react.dev',
            sharedBy: { name: 'Alex Johnson' },
            uploadedAt: new Date('2024-12-01'),
          },
        ],
        estimatedDuration: 20,
        actualDuration: 8,
        preferredPlatform: 'zoom',
        meetingLink: 'https://zoom.us/j/123456789',
        createdAt: new Date('2024-11-28'),
        startedAt: new Date('2024-12-01'),
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      'in-progress': <Play className="w-4 h-4" />,
      completed: <Award className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      disputed: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // API call would go here
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Exchange Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The skill exchange you're looking for doesn't exist or has been
            removed.
          </p>
          <Button onClick={() => navigate('/skill-exchange')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Skill Exchange
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Video className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    {
      id: 'resources',
      label: 'Resources',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{exchange.title} - Skill Exchange | SkillVerse</title>
        <meta name="description" content={exchange.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
              <Link to="/skill-exchange" className="hover:text-white">
                Skill Exchange
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{exchange.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      exchange.status
                    )}`}
                  >
                    {getStatusIcon(exchange.status)}
                    {exchange.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="bg-blue-500/30 text-white px-3 py-1 rounded-full text-sm">
                    {exchange.matchScore}% Match
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-3">{exchange.title}</h1>
                <p className="text-blue-100 max-w-2xl">{exchange.description}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => navigate('/skill-exchange')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {exchange.meetingLink && (
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    <Video className="w-4 h-4 mr-2" /> Join Session
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 rounded-t-lg'
                      : 'text-blue-200 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" /> Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Requester */}
                      <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                        <img
                          src={exchange.requester.profileImage}
                          alt={exchange.requester.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-blue-600 font-medium mb-1">
                            OFFERING
                          </p>
                          <h4 className="font-semibold text-gray-900">
                            {exchange.requester.name}
                          </h4>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {exchange.requester.rating} •{' '}
                            {exchange.requester.completedExchanges} exchanges
                          </div>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {exchange.offeredSkill.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({exchange.offeredSkill.level})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Provider */}
                      <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                        <img
                          src={exchange.provider.profileImage}
                          alt={exchange.provider.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-purple-600 font-medium mb-1">
                            TEACHING
                          </p>
                          <h4 className="font-semibold text-gray-900">
                            {exchange.provider.name}
                          </h4>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {exchange.provider.rating} •{' '}
                            {exchange.provider.completedExchanges} exchanges
                          </div>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {exchange.requestedSkill.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({exchange.requestedSkill.level})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Objectives */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" /> Learning Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {exchange.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" /> Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exchange.milestones.map((milestone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              milestone.status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : milestone.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {milestone.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : milestone.status === 'in-progress' ? (
                              <Play className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {milestone.status === 'completed'
                                ? `Completed ${new Date(
                                    milestone.completedAt
                                  ).toLocaleDateString()}`
                                : `Target: ${new Date(
                                    milestone.targetDate
                                  ).toLocaleDateString()}`}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              milestone.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : milestone.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {milestone.status.replace('-', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            strokeDasharray={`${
                              exchange.progress.overallProgress * 3.51
                            } 351`}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient
                              id="gradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-900">
                            {exchange.progress.overallProgress}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {exchange.requester.name.split(' ')[0]}'s Progress
                          </span>
                          <span className="font-medium">
                            {exchange.progress.requesterProgress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${exchange.progress.requesterProgress}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {exchange.provider.name.split(' ')[0]}'s Progress
                          </span>
                          <span className="font-medium">
                            {exchange.progress.providerProgress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{
                              width: `${exchange.progress.providerProgress}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Exchange Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Video className="w-4 h-4" /> Sessions
                      </span>
                      <span className="font-medium">
                        {exchange.sessions.filter((s) => s.status === 'completed')
                          .length}{' '}
                        / {exchange.sessions.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Hours
                      </span>
                      <span className="font-medium">
                        {exchange.actualDuration} / {exchange.estimatedDuration}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Started
                      </span>
                      <span className="font-medium">
                        {new Date(exchange.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Resources
                      </span>
                      <span className="font-medium">
                        {exchange.sharedResources.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" /> Schedule Session
                    </Button>
                    <Button className="w-full" variant="outline">
                      <FileText className="w-4 h-4 mr-2" /> Share Resource
                    </Button>
                    <Button className="w-full" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" /> Send Message
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sessions
                </h2>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" /> Schedule New Session
                </Button>
              </div>

              <div className="grid gap-4">
                {exchange.sessions.map((session) => (
                  <Card key={session.sessionNumber}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              session.status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            <Video className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Session {session.sessionNumber}: {session.topic}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(session.scheduledAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {session.duration} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              session.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {session.status}
                          </span>
                          {session.status === 'scheduled' && (
                            <Button size="sm">Join</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {exchange.messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex gap-3 ${
                        msg.sender._id === '1' ? 'justify-end' : ''
                      }`}
                    >
                      {msg.sender._id !== '1' && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <div
                        className={`max-w-md px-4 py-2 rounded-2xl ${
                          msg.sender._id === '1'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender._id === '1'
                              ? 'text-blue-200'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex gap-3 w-full">
                    <Button variant="outline" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Shared Resources
                </h2>
                <Button>
                  <Paperclip className="w-4 h-4 mr-2" /> Upload Resource
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exchange.sharedResources.map((resource, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          {resource.type === 'document' ? (
                            <FileText className="w-5 h-5" />
                          ) : (
                            <ExternalLink className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {resource.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Shared by {resource.sharedBy.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(resource.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>
                    Track your progress through this skill exchange
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Overall Progress */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Overall Progress</span>
                        <span className="font-bold text-blue-600">
                          {exchange.progress.overallProgress}%
                        </span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${exchange.progress.overallProgress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Time Stats */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-blue-600">
                          {exchange.actualDuration}
                        </p>
                        <p className="text-gray-600">Hours Completed</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-purple-600">
                          {exchange.sessions.filter((s) => s.status === 'completed')
                            .length}
                        </p>
                        <p className="text-gray-600">Sessions Done</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {exchange.milestones.filter(
                            (m) => m.status === 'completed'
                          ).length}
                        </p>
                        <p className="text-gray-600">Milestones</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default SkillExchangeDetail;
