import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaClock, FaTimes, FaStar, FaSpinner } from 'react-icons/fa';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getReceivedRequests, acceptExchangeRequest, rejectExchangeRequest } from '@/api/skillExchangeApi';
import toast from 'react-hot-toast';

const MatchList = ({ exchangeId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch matches from API
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReceivedRequests();
      const data = response?.data?.data?.requests || response?.data?.requests || response?.data || [];

      // Filter by exchangeId if provided, and transform data
      const filteredData = (exchangeId
        ? data.filter(m => m.exchangeId === exchangeId || m.exchange?._id === exchangeId)
        : data
      ).map(m => ({
        _id: m._id,
        user: {
          _id: m.requester?._id || m.user?._id,
          name: m.requester?.name || m.user?.name || 'Unknown',
          avatar: m.requester?.profileImage?.url || m.user?.avatar || '',
          rating: m.requester?.rating || m.user?.rating || 4.5,
        },
        offering: m.offeredSkill?.name || m.offering || 'N/A',
        seeking: m.requestedSkill?.name || m.seeking || 'N/A',
        message: m.message || m.description || 'No message',
        status: m.status || 'pending',
      }));

      setMatches(filteredData);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      toast.error('Failed to load matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [exchangeId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleAccept = async (matchId) => {
    try {
      setActionLoading(matchId);
      await acceptExchangeRequest(matchId);
      setMatches(matches.map((m) => (m._id === matchId ? { ...m, status: 'accepted' } : m)));
      toast.success('Match accepted!');
    } catch (error) {
      console.error('Failed to accept match:', error);
      toast.error(error.response?.data?.message || 'Failed to accept match');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (matchId) => {
    try {
      setActionLoading(matchId);
      await rejectExchangeRequest(matchId, 'User declined');
      setMatches(matches.filter((m) => m._id !== matchId));
      toast.success('Match rejected');
    } catch (error) {
      console.error('Failed to reject match:', error);
      toast.error(error.response?.data?.message || 'Failed to reject match');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      'in-progress': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'pending') return <FaClock className="text-yellow-600 h-3 w-3" />;
    if (status === 'accepted' || status === 'in-progress') return <FaCheck className="text-green-600 h-3 w-3" />;
    return <FaTimes className="text-red-600 h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Matched Learners</h2>
        <p className="text-gray-600">{matches.length} match(es) interested in this exchange</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-blue-600 text-3xl" />
        </div>
      ) : matches.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-600">No matches yet. Check back soon!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match._id}>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1 flex gap-4">
                    <img
                      src={match.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.user.name)}`}
                      alt={match.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{match.user.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <FaStar className="text-yellow-500 h-3 w-3" />
                          <span>{match.user.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{match.message}</p>
                      <div className="flex gap-3 text-xs">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          Offers: {match.offering}
                        </span>
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                          Seeks: {match.seeking}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(match.status)}`}>
                      {getStatusIcon(match.status)}
                      <span className="capitalize">{match.status}</span>
                    </div>

                    {match.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAccept(match._id)}
                          disabled={actionLoading === match._id}
                        >
                          {actionLoading === match._id ? (
                            <FaSpinner className="animate-spin h-4 w-4" />
                          ) : (
                            <>
                              <FaCheck className="mr-1 h-3 w-3" /> Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(match._id)}
                          disabled={actionLoading === match._id}
                        >
                          <FaTimes className="mr-1 h-3 w-3" /> Reject
                        </Button>
                      </div>
                    )}

                    {match.status === 'accepted' && (
                      <Button size="sm" variant="primary">
                        Message
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;