import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaUser, FaStar, FaSpinner } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';
import { acceptExchangeRequest, rejectExchangeRequest } from '@/api/skillExchangeApi';

const ExchangeRequest = ({ request, onUpdate }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(request?.status || 'pending');
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // If no request prop, show empty state
  if (!request) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-600">No exchange request data available</p>
          </div>
        </Card>
      </div>
    );
  }

  // Map request data for display
  const displayData = {
    id: request._id || request.id,
    from: {
      name: request.requester?.name || request.from?.name || 'Unknown User',
      avatar: request.requester?.profileImage?.url || request.from?.avatar || '',
      rating: request.requester?.rating || request.from?.rating || 4.5,
      reviews: request.requester?.reviewCount || request.from?.reviews || 0,
    },
    offering: {
      skill: request.offeredSkill?.name || request.offering?.skill || 'Not specified',
      level: request.offeredSkill?.level || request.offering?.level || 'Intermediate',
      experience: request.offeredSkill?.experience || request.offering?.experience || 'Not specified',
      hourlyRate: 'Free Exchange',
    },
    requesting: {
      skill: request.requestedSkill?.name || request.requesting?.skill || 'Not specified',
      level: request.requestedSkill?.level || request.requesting?.level || 'Any level',
      description: request.description || request.requesting?.description || 'No description provided',
    },
    requestedHours: request.estimatedDuration || request.requestedHours || 20,
    offeringHours: request.estimatedDuration || request.offeringHours || 20,
    message: request.message || request.description || 'No message provided',
    createdAt: request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently',
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptExchangeRequest(displayData.id);
      setStatus('accepted');
      toast.success('Exchange request accepted!');
      onUpdate?.(); // Refresh parent if callback provided
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectExchangeRequest(displayData.id, 'User declined the exchange');
      setStatus('rejected');
      toast.error('Exchange request rejected');
      onUpdate?.();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeCounterOffer = () => {
    navigate(`/skill-exchange/${displayData.id}/counter-offer`);
  };

  const handleMessage = () => {
    const userId = request.requester?._id || request.from?._id;
    if (userId) {
      navigate(`/messages/${userId}`);
    } else {
      toast.error('Cannot find user to message');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={displayData.from.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayData.from.name}`}
                alt={displayData.from.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{displayData.from.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{displayData.from.rating}</span>
                    <span className="text-gray-600">({displayData.from.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-4 py-2 rounded-full font-semibold text-sm ${
                  status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {status === 'pending' && '⏳ Pending'}
                {status === 'accepted' && '✅ Accepted'}
                {status === 'rejected' && '❌ Rejected'}
              </span>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Skills Exchange */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* They're offering */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">They're Offering</h3>
              <div className="space-y-2">
                <p className="font-semibold text-lg text-blue-600">{displayData.offering.skill}</p>
                <div className="text-sm space-y-1 text-gray-700">
                  <p>Level: {displayData.offering.level}</p>
                  <p>Experience: {displayData.offering.experience}</p>
                  <p className="text-blue-600 font-semibold mt-2">{displayData.offering.hourlyRate}</p>
                </div>
              </div>
            </div>

            {/* You're offering */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">You're Offering</h3>
              <div className="space-y-2">
                <p className="font-semibold text-lg text-green-600">{displayData.requesting.skill}</p>
                <div className="text-sm space-y-1 text-gray-700">
                  <p>Level: {displayData.requesting.level}</p>
                  <p className="text-green-600 font-semibold mt-2">Free Exchange</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">Exchange Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">They're offering</p>
                <p className="text-2xl font-bold text-blue-600">{displayData.offeringHours} hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">You're offering</p>
                <p className="text-2xl font-bold text-green-600">{displayData.requestedHours} hours</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Message</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">{displayData.message}</p>
              <p className="text-sm text-gray-500 mt-3">Requested {displayData.createdAt}</p>
            </div>
          </div>

          {/* Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            {showDetails ? '▼ Hide Details' : '▶ Show More Details'}
          </button>

          {/* Hidden Details */}
          {showDetails && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Why they want to learn {displayData.requesting.skill}</p>
                <p className="text-gray-700 mt-1">{displayData.requesting.description}</p>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600">Request ID: #{displayData.id} • Created {displayData.createdAt}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {status === 'pending' && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleReject}
                variant="outline"
                icon={loading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                className="flex-1"
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                onClick={handleMakeCounterOffer}
                variant="outline"
                icon={<FaClock />}
                className="flex-1"
                disabled={loading}
              >
                Counter Offer
              </Button>
              <Button
                onClick={handleAccept}
                variant="primary"
                icon={loading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                className="flex-1"
                disabled={loading}
              >
                Accept Exchange
              </Button>
            </div>
          )}

          {status === 'accepted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-semibold">
                ✅ Exchange accepted! Start messaging to arrange your first session.
              </p>
              <Button variant="primary" className="w-full mt-3" onClick={handleMessage}>
                Message {displayData.from.name}
              </Button>
            </div>
          )}

          {status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-semibold">
                ❌ Exchange request declined.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExchangeRequest;
