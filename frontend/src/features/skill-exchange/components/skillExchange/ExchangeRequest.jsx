import React, { useState } from 'react';
import { FaCheck, FaTimes, FaClock, FaUser, FaStar } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

const ExchangeRequest = ({ request = null }) => {
  const [status, setStatus] = useState('pending');
  const [showDetails, setShowDetails] = useState(false);

  const mockRequest = request || {
    id: 1,
    from: {
      name: 'Alice Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 4.8,
      reviews: 45,
    },
    offering: {
      skill: 'Web Design',
      level: 'Advanced',
      experience: '3 years',
      hourlyRate: 'Free Exchange',
    },
    requesting: {
      skill: 'Python Programming',
      level: 'Beginner to Intermediate',
      description: 'I want to learn Python for web development',
    },
    requestedHours: 20,
    offeringHours: 20,
    message: 'I really love your Python teaching style! I can help with UI/UX design for your projects.',
    createdAt: '2 days ago',
  };

  const handleAccept = () => {
    setStatus('accepted');
    toast.success('Exchange request accepted!');
  };

  const handleReject = () => {
    setStatus('rejected');
    toast.error('Exchange request rejected');
  };

  const handleMakeCounterOffer = () => {
    toast.success('Counter offer feature coming soon');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={mockRequest.from.avatar}
                alt={mockRequest.from.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{mockRequest.from.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{mockRequest.from.rating}</span>
                    <span className="text-gray-600">({mockRequest.from.reviews} reviews)</span>
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
                <p className="font-semibold text-lg text-blue-600">{mockRequest.offering.skill}</p>
                <div className="text-sm space-y-1 text-gray-700">
                  <p>Level: {mockRequest.offering.level}</p>
                  <p>Experience: {mockRequest.offering.experience}</p>
                  <p className="text-blue-600 font-semibold mt-2">{mockRequest.offering.hourlyRate}</p>
                </div>
              </div>
            </div>

            {/* You're offering */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">You're Offering</h3>
              <div className="space-y-2">
                <p className="font-semibold text-lg text-green-600">{mockRequest.requesting.skill}</p>
                <div className="text-sm space-y-1 text-gray-700">
                  <p>Level: {mockRequest.requesting.level}</p>
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
                <p className="text-2xl font-bold text-blue-600">{mockRequest.offeringHours} hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">You're offering</p>
                <p className="text-2xl font-bold text-green-600">{mockRequest.requestedHours} hours</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Message</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">{mockRequest.message}</p>
              <p className="text-sm text-gray-500 mt-3">Requested {mockRequest.createdAt}</p>
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
                <p className="text-sm font-semibold text-gray-700">Why they want to learn {mockRequest.requesting.skill}</p>
                <p className="text-gray-700 mt-1">{mockRequest.requesting.description}</p>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600">Request ID: #{mockRequest.id} • Created {mockRequest.createdAt}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {status === 'pending' && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleReject}
                variant="outline"
                icon={<FaTimes />}
                className="flex-1"
              >
                Reject
              </Button>
              <Button
                onClick={handleMakeCounterOffer}
                variant="outline"
                icon={<FaClock />}
                className="flex-1"
              >
                Counter Offer
              </Button>
              <Button
                onClick={handleAccept}
                variant="primary"
                icon={<FaCheck />}
                className="flex-1"
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
              <Button variant="primary" className="w-full mt-3">
                Message {mockRequest.from.name}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExchangeRequest;
