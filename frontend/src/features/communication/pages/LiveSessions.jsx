import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaCalendar, FaClock, FaUsers, FaSearch, FaFilter, FaVideo, FaChevronRight } from 'react-icons/fa';
import {
  getUpcomingSessions,
  joinLiveSession,
  selectUpcomingSessions,
  selectSessionLoading,
} from '../../../redux/slices/sessionSlice';
import useAuth from '../../../hooks/useAuth';
import config from '../../../config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CardSkeletonLoader } from '../../shared/components/Loader';
import { formatDate, formatTime } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const SessionCard = ({ session, onRegister }) => {
  const { isAuthenticated } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="relative h-48 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden p-0">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <FaVideo className="text-6xl opacity-30" />
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {session.status === 'scheduled' ? 'Upcoming' : 'Live'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 flex flex-col flex-1">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {session.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {session.description}
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaCalendar className="text-blue-600" />
              <span>{formatDate(session.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-blue-600" />
              <span>{formatTime(session.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              <span>{session.registeredCount || 0} registered</span>
            </div>
          </div>

          <div className="mt-auto space-y-2">
            {isRegistered ? (
              <Button
                variant="outline"
                className="w-full bg-green-50"
                disabled
              >
                ✓ Registered
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please log in first');
                    return;
                  }
                  onRegister(session._id);
                  setIsRegistered(true);
                  toast.success('Registered for session!');
                }}
              >
                Register Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LiveSessions = () => {
  const dispatch = useDispatch();
  const sessions = useSelector(selectUpcomingSessions);
  const loading = useSelector(selectSessionLoading);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSessions, setFilteredSessions] = useState([]);

  useEffect(() => {
    dispatch(getUpcomingSessions());
  }, [dispatch]);

  useEffect(() => {
    let filtered = sessions || [];

    if (filter !== 'all') {
      filtered = filtered.filter((s) => s.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  }, [sessions, filter, searchTerm]);

  return (
    <>
      <Helmet>
        <title>Live Sessions | {config.app.name}</title>
        <meta name="description" content="Join live learning sessions with instructors" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Live Sessions</h1>
            <p className="text-gray-600">Join interactive sessions with instructors and fellow learners</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sessions</option>
                  <option value="scheduled">Upcoming</option>
                  <option value="live">Live Now</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sessions Grid */}
          {loading && sessions.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeletonLoader key={i} />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📹</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600">Check back soon for upcoming live sessions</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onRegister={async () => {
                    try {
                      await dispatch(joinLiveSession(session._id)).unwrap();
                      toast.success('Successfully registered for session!');
                    } catch (error) {
                      toast.error(error || 'Failed to register for session');
                    }
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Featured Section */}
          {filteredSessions.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Join Live Sessions?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: '🎯',
                    title: 'Interactive Learning',
                    desc: 'Ask questions and get immediate feedback from instructors',
                  },
                  {
                    icon: '👥',
                    title: 'Community Engagement',
                    desc: 'Connect with peers and build meaningful relationships',
                  },
                  {
                    icon: '📊',
                    title: 'Better Retention',
                    desc: 'Live interaction increases learning retention by 30%',
                  },
                ].map((item, i) => (
                  <Card key={i}>
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LiveSessions;
