import React, { useState } from 'react';
import { FaPlus, FaClock, FaCheckCircle, FaTimesCircle, FaStar, FaUsers } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

const SkillExchangeDashboard = () => {
  const [exchanges, setExchanges] = useState([
    { id: 1, skill: 'Web Design', offering: 'Python', status: 'active', partner: 'Alice Johnson', hoursCompleted: 8, hoursTotal: 20, rating: 4.8 },
    { id: 2, skill: 'JavaScript', offering: 'UI Design', status: 'active', partner: 'Bob Smith', hoursCompleted: 12, hoursTotal: 20, rating: 4.9 },
    { id: 3, skill: 'React', offering: 'Mobile Dev', status: 'completed', partner: 'Carol White', hoursCompleted: 20, hoursTotal: 20, rating: 5.0 },
    { id: 4, skill: 'TypeScript', offering: 'Cloud AWS', status: 'pending', partner: 'David Lee', hoursCompleted: 0, hoursTotal: 15, rating: null },
  ]);

  const stats = {
    activeExchanges: exchanges.filter((e) => e.status === 'active').length,
    completedExchanges: exchanges.filter((e) => e.status === 'completed').length,
    hoursLearned: exchanges.reduce((acc, e) => acc + e.hoursCompleted, 0),
    totalRating: exchanges.filter((e) => e.rating).length > 0
      ? (exchanges.reduce((acc, e) => acc + (e.rating || 0), 0) / exchanges.filter((e) => e.rating).length).toFixed(1)
      : 0,
  };

  const handleStartExchange = () => {
    toast.success('Exchange started! Start messaging with your partner.');
  };

  const handleCompleteExchange = (id) => {
    setExchanges(exchanges.map((e) => (e.id === id ? { ...e, status: 'completed' } : e)));
    toast.success('Exchange marked as completed');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Skill Exchange Dashboard</h1>
          <Button variant="primary" icon={<FaPlus />} onClick={() => toast.success('New exchange created!')}>
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
                        onClick={handleStartExchange}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        Start
                      </Button>
                    )}
                    {exchange.status === 'active' && (
                      <>
                        <Button
                          onClick={() => toast.success('Opening chat...')}
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
                        >
                          Complete
                        </Button>
                      </>
                    )}
                    {exchange.status === 'completed' && (
                      <Button
                        onClick={() => toast.success('Opening review...')}
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
