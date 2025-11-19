import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaStar, FaClock, FaMapPin, FaPhone, FaMessageCircle } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import MatchList from './MatchList';
import toast from 'react-hot-toast';

const ExchangeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isInterested, setIsInterested] = useState(false);

  // Mock data
  const exchange = {
    _id: id,
    title: 'Learn React in exchange for Python tutoring',
    description:
      'I am an experienced React developer with 5+ years of experience. I can teach you React fundamentals, hooks, state management, and build real-world projects. In return, I am looking for someone to help me master Python for data science and machine learning.',
    offering: 'React',
    seeking: 'Python',
    duration: '2-3',
    availability: 'weekends',
    user: {
      _id: 'user123',
      name: 'John Developer',
      avatar: '',
      bio: 'Full-stack developer passionate about teaching',
      rating: 4.8,
      reviews: 24,
      level: 'Expert',
    },
    details: {
      offeringDetails: 'React ES6+, Hooks, Redux, Next.js, real-world projects',
      seekingDetails: 'Python fundamentals, data structures, libraries like NumPy and Pandas',
      location: 'Online (Video Call)',
      timezone: 'UTC-5',
      maxStudents: 1,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const handleInterest = () => {
    setIsInterested(!isInterested);
    toast.success(isInterested ? 'Interest removed' : 'Interest registered!');
  };

  const handleMessage = () => {
    navigate(`/messages/${exchange.user._id}`);
  };

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
