// ============================================
// LIVE SESSION MANAGER COMPONENT
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaPlus, FaEdit, FaTrash, FaCalendar, FaUsers, FaSpinner, FaPlay } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMySessions, deleteSession } from '@/api/liveSessionApi';
import toast from 'react-hot-toast';
import { format, isPast, isFuture } from 'date-fns';

const LiveSessionManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all');

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMySessions();
      const data = response.data?.sessions || response.data || [];
      
      setSessions(data.map(session => ({
        id: session._id,
        title: session.title,
        description: session.description,
        scheduledAt: session.scheduledAt,
        duration: session.duration || 60,
        maxParticipants: session.maxParticipants || 50,
        participants: session.participants?.length || 0,
        status: session.status || (isPast(new Date(session.scheduledAt)) ? 'completed' : 'upcoming'),
        course: session.course?.title || 'General Session',
      })));
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return session.status === 'upcoming' || session.status === 'scheduled';
    if (filter === 'completed') return session.status === 'completed' || session.status === 'ended';
    if (filter === 'live') return session.status === 'live' || session.status === 'in-progress';
    return true;
  });

  const stats = {
    total: sessions.length,
    upcoming: sessions.filter(s => s.status === 'upcoming' || s.status === 'scheduled').length,
    completed: sessions.filter(s => s.status === 'completed' || s.status === 'ended').length,
    live: sessions.filter(s => s.status === 'live' || s.status === 'in-progress').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Session Manager</h1>
          <Button onClick={() => navigate('/educator/sessions/create')}>
            <FaPlus className="mr-2" /> Create Session
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Sessions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaVideo className="text-blue-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaCalendar className="text-green-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Live Now</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.live}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FaPlay className="text-red-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaVideo className="text-purple-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6">
          <div className="p-4 flex gap-3 flex-wrap">
            {['all', 'upcoming', 'live', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </Card>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FaVideo className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-600 mb-4">Create your first live session to get started</p>
                <Button onClick={() => navigate('/educator/sessions/create')}>
                  <FaPlus className="mr-2" /> Create Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          session.status === 'live' || session.status === 'in-progress'
                            ? 'bg-red-100 text-red-700 animate-pulse'
                            : session.status === 'upcoming' || session.status === 'scheduled'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status === 'live' || session.status === 'in-progress' ? '🔴 Live' : session.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{session.course}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaCalendar />
                          {session.scheduledAt ? format(new Date(session.scheduledAt), 'MMM dd, yyyy h:mm a') : 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUsers />
                          {session.participants}/{session.maxParticipants} participants
                        </span>
                        <span>{session.duration} min</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {(session.status === 'upcoming' || session.status === 'scheduled') && (
                        <Button
                          variant="default"
                          onClick={() => navigate(`/sessions/${session.id}/room`)}
                        >
                          <FaPlay className="mr-2" /> Start
                        </Button>
                      )}
                      {(session.status === 'live' || session.status === 'in-progress') && (
                        <Button
                          variant="default"
                          onClick={() => navigate(`/sessions/${session.id}/room`)}
                        >
                          <FaVideo className="mr-2" /> Join
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/educator/sessions/${session.id}/edit`)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSessionManager;
