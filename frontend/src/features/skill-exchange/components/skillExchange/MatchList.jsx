import React, { useState } from 'react';
import { FaCheck, FaTimer, FaTimes, FaUser, FaStar } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

const MatchList = ({ exchangeId }) => {
  const [matches, setMatches] = useState([
    {
      _id: '1',
      user: { name: 'Alice Chen', avatar: '', rating: 4.9 },
      offering: 'Python',
      seeking: 'React',
      message: 'I have 3 years of Python experience and looking to learn React!',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '2',
      user: { name: 'Bob Smith', avatar: '', rating: 4.7 },
      offering: 'Python',
      seeking: 'React',
      message: 'Great exchange opportunity! I teach Python basics and intermediates.',
      status: 'accepted',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleAccept = (matchId) => {
    setMatches(matches.map((m) => (m._id === matchId ? { ...m, status: 'accepted' } : m)));
    toast.success('Match accepted!');
  };

  const handleReject = (matchId) => {
    setMatches(matches.filter((m) => m._id !== matchId));
    toast.success('Match rejected');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'pending') return <FaTimer className="text-yellow-600" />;
    if (status === 'accepted') return <FaCheck className="text-green-600" />;
    return <FaTimes className="text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Matched Learners</h2>
        <p className="text-gray-600">{matches.length} match(es) interested in this exchange</p>
      </div>

      {matches.length === 0 ? (
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
                      src={match.user.avatar || `https://i.pravatar.cc/48?img=${match.user._id}`}
                      alt={match.user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{match.user.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <FaStar className="text-yellow-500" />
                          <span>{match.user.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{match.message}</p>
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
                      <span>{match.status.charAt(0).toUpperCase() + match.status.slice(1)}</span>
                    </div>

                    {match.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<FaCheck />}
                          onClick={() => handleAccept(match._id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<FaTimes />}
                          onClick={() => handleReject(match._id)}
                        >
                          Reject
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
