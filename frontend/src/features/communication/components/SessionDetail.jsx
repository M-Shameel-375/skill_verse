import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaClock, FaMapPin, FaUsers, FaPlayCircle, FaShare, FaBell, FaSpinner } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';
import { getSessionById, joinLiveSession, leaveLiveSession } from '../../../api/liveSessionApi';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSessionById(id);
      const data = response.data?.data || response.data;
      setSession(data);
      setIsRegistered(data.isRegistered || false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch session details');
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleRegister = async () => {
    try {
      setActionLoading(true);
      if (isRegistered) {
        await leaveLiveSession(id);
        toast.success('Unregistered from session');
      } else {
        await joinLiveSession(id);
        toast.success('Registered for session!');
      }
      setIsRegistered(!isRegistered);
      fetchSession(); // Refresh session data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update registration');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReminder = () => {
    toast.success('Reminder set! You will be notified before the session.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Session link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
          <Button variant="primary" onClick={() => navigate('/live-sessions')}>
            Back to Sessions
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft />
          Back to Sessions
        </button>

        {/* Header */}
        <Card className="mb-6">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded">
                    {session.category}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded ${
                    session.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                    session.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {session.difficulty}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{session.title}</h1>
                <p className="text-gray-600 text-lg">{session.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant={isRegistered ? 'outline' : 'primary'}
                  fullWidth
                  icon={actionLoading ? <FaSpinner className="animate-spin" /> : <FaPlayCircle />}
                  onClick={handleRegister}
                  disabled={actionLoading}
                >
                  {isRegistered ? 'Registered' : 'Register Now'}
                </Button>
                <Button variant="outline" fullWidth icon={<FaBell />} onClick={handleReminder}>
                  Set Reminder
                </Button>
                <Button variant="outline" fullWidth icon={<FaShare />} onClick={handleShare}>
                  Share
                </Button>
              </div>
            </div>

            {/* Instructor */}
            {session.instructor && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center gap-4">
                <img
                  src={session.instructor.avatar || session.instructor.profileImage || `https://i.pravatar.cc/64?img=${session.instructor._id || 1}`}
                  alt={session.instructor.name || 'Instructor'}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{session.instructor.name || 'Instructor'}</h4>
                  <p className="text-sm text-gray-600">{session.instructor.bio || session.instructor.expertise || ''}</p>
                  {session.instructor.rating && (
                    <p className="text-sm mt-1">⭐ {session.instructor.rating} ({session.instructor.reviews || 0} reviews)</p>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Details */}
            <Card>
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Session Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold">{new Date(session.startTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaMapPin className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{session.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Participants</p>
                      <p className="font-semibold">{session.registeredCount}/{session.maxParticipants}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{session.duration} minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Topics */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Topics Covered</h2>
                <div className="flex flex-wrap gap-2">
                  {session.topics.map((topic) => (
                    <span key={topic} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Prerequisites */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Prerequisites</h2>
                <ul className="space-y-2">
                  {session.prerequisites.map((prereq) => (
                    <li key={prereq} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Resources */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resources</h2>
                <div className="space-y-2">
                  {session.resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                    >
                      <FaPlayCircle />
                      {resource.name}
                    </a>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Seats Available</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Registered</span>
                    <span>{session.registeredCount}/{session.maxParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${(session.registeredCount / session.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {session.maxParticipants - session.registeredCount} spots left
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
