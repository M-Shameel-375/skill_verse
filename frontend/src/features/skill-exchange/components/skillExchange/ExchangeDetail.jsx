import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaStar, FaClock, FaMapPin, FaPhone, FaMessageCircle, FaSpinner } from 'react-icons/fa';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import MatchList from './MatchList';
import toast from 'react-hot-toast';
import { getExchangeById, acceptExchangeRequest } from '@/api/skillExchangeApi';

const ExchangeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchange, setExchange] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch exchange data from API
  const fetchExchange = useCallback(async () => {
    if (!id) {
      setError('Exchange ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getExchangeById(id);
      
      if (response.data?.data) {
        const data = response.data.data;
        // Map API response to component format
        setExchange({
          _id: data._id,
          title: data.title || `${data.offeredSkill?.name || 'Skill'} for ${data.requestedSkill?.name || 'Skill'}`,
          description: data.description || '',
          offering: data.offeredSkill?.name || 'Not specified',
          seeking: data.requestedSkill?.name || 'Not specified',
          duration: data.estimatedDuration ? `${Math.floor(data.estimatedDuration / 60)}-${Math.ceil(data.estimatedDuration / 60) + 1}` : '1-2',
          availability: data.proposedSchedule?.[0]?.date ? 'scheduled' : 'flexible',
          status: data.status,
          user: {
            _id: data.requester?._id || data.provider?._id,
            name: data.requester?.name || data.provider?.name || 'Unknown User',
            avatar: data.requester?.profileImage?.url || data.provider?.profileImage?.url || '',
            bio: data.requester?.bio || data.provider?.bio || '',
            rating: data.requester?.rating || data.provider?.rating || 4.5,
            reviews: data.requester?.reviewCount || data.provider?.reviewCount || 0,
            level: data.offeredSkill?.level || 'Intermediate',
          },
          details: {
            offeringDetails: data.offeredSkill?.description || data.objectives?.join(', ') || 'No details provided',
            seekingDetails: data.requestedSkill?.description || 'No details provided',
            location: data.preferredPlatform || 'Online (Video Call)',
            timezone: data.proposedSchedule?.[0]?.timezone || 'Flexible',
            maxStudents: 1,
          },
          createdAt: data.createdAt,
          meetingLink: data.meetingLink,
        });
      } else {
        setError('Exchange not found');
      }
    } catch (err) {
      console.error('Error fetching exchange:', err);
      if (err.response?.status === 404) {
        setError('Exchange not found');
      } else {
        setError(err.response?.data?.message || 'Failed to load exchange details');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExchange();
  }, [fetchExchange]);

  const handleInterest = async () => {
    try {
      setActionLoading(true);
      if (!isInterested) {
        await acceptExchangeRequest(id);
        toast.success('Interest registered! The user will be notified.');
      }
      setIsInterested(!isInterested);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register interest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    if (exchange?.user?._id) {
      navigate(`/messages/${exchange.user._id}`);
    } else {
      toast.error('Cannot start message - user not found');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading exchange details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !exchange) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Exchange not found'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="primary" onClick={fetchExchange}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft />
          Back to Marketplace
        </button>

        {/* Header */}
        <Card className="mb-6">
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{exchange.title}</h1>

            {/* User Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <img
                  src={exchange.user.avatar || `https://i.pravatar.cc/64?img=${exchange.user._id}`}
                  alt={exchange.user.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{exchange.user.name}</h2>
                  <p className="text-sm text-gray-600 mb-1">{exchange.user.bio}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      <span className="font-semibold">{exchange.user.rating}</span>
                      <span className="text-gray-600">({exchange.user.reviews} reviews)</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <span className="text-blue-600 font-medium">{exchange.user.level}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant={isInterested ? 'primary' : 'outline'}
                  onClick={handleInterest}
                  icon={isInterested ? <FaUser /> : undefined}
                >
                  {isInterested ? 'Interested!' : 'Show Interest'}
                </Button>
                <Button variant="primary" onClick={handleMessage} icon={<FaMessageCircle />}>
                  Message
                </Button>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Offering</h3>
                <p className="text-blue-700 font-medium mb-2">{exchange.offering}</p>
                <p className="text-sm text-gray-700">{exchange.details.offeringDetails}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Seeking</h3>
                <p className="text-green-700 font-medium mb-2">{exchange.seeking}</p>
                <p className="text-sm text-gray-700">{exchange.details.seekingDetails}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="mb-6">
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About This Exchange</h3>
            <p className="text-gray-700 leading-relaxed">{exchange.description}</p>
          </div>
        </Card>

        {/* Details */}
        <Card className="mb-6">
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Session Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaClock className="text-blue-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">{exchange.duration} hours per session</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaMapPin className="text-blue-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{exchange.details.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-blue-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-600">Availability</p>
                  <p className="font-semibold text-gray-900">{exchange.availability.charAt(0).toUpperCase() + exchange.availability.slice(1)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaUser className="text-blue-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-600">Max Students</p>
                  <p className="font-semibold text-gray-900">{exchange.details.maxStudents} person</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Matches */}
        <MatchList exchangeId={id} />
      </div>
    </div>
  );
};

export default ExchangeDetail;
