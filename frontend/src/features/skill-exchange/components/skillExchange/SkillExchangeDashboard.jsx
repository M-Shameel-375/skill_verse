import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaClock, FaCheckCircle, FaTimesCircle, FaStar, FaUsers, FaSpinner } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getMyExchanges, completeExchange, acceptExchangeRequest } from '@/api/skillExchangeApi';

const SkillExchangeDashboard = () => {
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch user's exchanges from API
  const fetchExchanges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyExchanges();
      
      if (response.data?.data) {
        const data = response.data.data;
        // Map API response to dashboard format
        const mappedExchanges = (Array.isArray(data) ? data : data.exchanges || []).map(ex => ({
          id: ex._id,
          skill: ex.requestedSkill?.name || 'Unknown Skill',
          offering: ex.offeredSkill?.name || 'Unknown Skill',
          status: ex.status === 'in-progress' ? 'active' : ex.status,
          partner: ex.requester?.name || ex.provider?.name || 'Unknown Partner',
          partnerId: ex.requester?._id || ex.provider?._id,
          hoursCompleted: ex.actualDuration || 0,
          hoursTotal: ex.estimatedDuration || 20,
          rating: ex.feedback?.requesterFeedback?.rating || ex.feedback?.providerFeedback?.rating || null,
        }));
        setExchanges(mappedExchanges);
      }
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      toast.error('Failed to load your exchanges');
      setExchanges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  const stats = {
    activeExchanges: exchanges.filter((e) => e.status === 'active' || e.status === 'in-progress').length,
    completedExchanges: exchanges.filter((e) => e.status === 'completed').length,
    hoursLearned: exchanges.reduce((acc, e) => acc + e.hoursCompleted, 0),
    totalRating: exchanges.filter((e) => e.rating).length > 0
      ? (exchanges.reduce((acc, e) => acc + (e.rating || 0), 0) / exchanges.filter((e) => e.rating).length).toFixed(1)
      : 0,
  };

  const handleStartExchange = async (exchangeId) => {
    try {
      setActionLoading(exchangeId);
      await acceptExchangeRequest(exchangeId);
      toast.success('Exchange started! Start messaging with your partner.');
      fetchExchanges(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start exchange');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteExchange = async (exchangeId) => {
    try {
      setActionLoading(exchangeId);
      await completeExchange(exchangeId);
      toast.success('Exchange marked as completed!');
      fetchExchanges(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete exchange');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChat = (partnerId) => {
    if (partnerId) {
      navigate(`/messages/${partnerId}`);
    } else {
      toast.error('Partner not found');
    }
  };

  const handleNewExchange = () => {
    navigate('/skill-exchange/create');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your exchanges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Skill Exchange Dashboard</h1>
          <Button variant="primary" icon={<FaPlus />} onClick={handleNewExchange}>
            New Exchange
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Active Exchanges</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeExchanges}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedExchanges}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Hours Learned</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.hoursLearned}h</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">⭐ {stats.totalRating}</p>
            </div>
          </Card>
        </div>

        {/* Exchanges List */}
        <div className="space-y-4">
          {exchanges.map((exchange) => (
            <Card key={exchange.id}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {exchange.skill} ⟷ {exchange.offering}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">with {exchange.partner}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          exchange.status === 'active'
                            ? 'bg-blue-100 text-blue-700'
                            : exchange.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {exchange.status === 'active' && '🔄 Active'}
                        {exchange.status === 'completed' && '✅ Completed'}
                        {exchange.status === 'pending' && '⏳ Pending'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">
                          {exchange.hoursCompleted} / {exchange.hoursTotal} hours
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition"
                          style={{ width: `${(exchange.hoursCompleted / exchange.hoursTotal) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Rating */}
                    {exchange.rating && (
                      <p className="text-sm text-yellow-600 font-semibold mt-3">
                        ⭐ Partner Rating: {exchange.rating}/5
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 md:flex-col w-full md:w-auto">
                    {exchange.status === 'pending' && (
                      <Button
                        onClick={() => handleStartExchange(exchange.id)}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        disabled={actionLoading === exchange.id}
                      >
                        {actionLoading === exchange.id ? <FaSpinner className="animate-spin" /> : 'Start'}
                      </Button>
                    )}
                    {(exchange.status === 'active' || exchange.status === 'in-progress') && (
                      <>
                        <Button
                          onClick={() => handleChat(exchange.partnerId)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Chat
                        </Button>
                        <Button
                          onClick={() => handleCompleteExchange(exchange.id)}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          disabled={actionLoading === exchange.id}
                        >
                          {actionLoading === exchange.id ? <FaSpinner className="animate-spin" /> : 'Complete'}
                        </Button>
                      </>
                    )}
                    {exchange.status === 'completed' && (
                      <Button
                        onClick={() => navigate(`/skill-exchange/${exchange.id}/review`)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillExchangeDashboard;
