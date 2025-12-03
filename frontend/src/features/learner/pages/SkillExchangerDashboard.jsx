// ============================================
// SKILL EXCHANGER DASHBOARD PAGE
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import {
  FaExchangeAlt,
  FaUsers,
  FaStar,
  FaCalendar,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaHourglass,
} from 'react-icons/fa';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const StatsCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-medium">{title}</h3>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
};

const SkillExchangerDashboard = ({ user: dbUser }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const stats = {
    totalExchanges: 12,
    activeExchanges: 3,
    completedExchanges: 9,
    averageRating: 4.8,
  };

  const [pendingRequests] = useState([
    {
      _id: '1',
      fromUser: { name: 'Alex Johnson', profileImage: { url: 'https://via.placeholder.com/40' } },
      skill: 'Python Programming',
      mySkill: 'Web Design',
      status: 'pending',
      createdAt: new Date(),
    },
    {
      _id: '2',
      fromUser: { name: 'Sarah Williams', profileImage: { url: 'https://via.placeholder.com/40' } },
      skill: 'Data Analysis',
      mySkill: 'JavaScript',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000),
    },
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = dbUser?.name || user?.firstName || 'Exchanger';

  return (
    <>
      <Helmet>
        <title>Skill Exchange Dashboard | SkillVerse</title>
      </Helmet>

      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}! 🤝
            </h1>
            <p className="text-gray-600">
              Manage your skill exchanges and connect with others.
            </p>
          </div>
          <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            🔄 Skill Exchanger
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Exchanges"
            value={stats.totalExchanges}
            icon={<FaExchangeAlt className="text-2xl" />}
            color="blue"
          />
          <StatsCard
            title="Active Exchanges"
            value={stats.activeExchanges}
            icon={<FaHourglass className="text-2xl" />}
            color="orange"
          />
          <StatsCard
            title="Completed"
            value={stats.completedExchanges}
            icon={<FaCheckCircle className="text-2xl" />}
            color="green"
          />
          <StatsCard
            title="Avg. Rating"
            value={`${stats.averageRating} ⭐`}
            icon={<FaStar className="text-2xl" />}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Requests</CardTitle>
                  <Link
                    to="/skill-exchange"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm"
                  >
                    View All <FaArrowRight />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={request.fromUser.profileImage?.url}
                            alt={request.fromUser.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{request.fromUser.name}</h4>
                            <p className="text-sm text-gray-600">
                              Wants: <span className="font-medium">{request.mySkill}</span> → 
                              Offers: <span className="font-medium">{request.skill}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Decline</Button>
                          <Button size="sm">Accept</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Skills */}
            <Card>
              <CardHeader>
                <CardTitle>My Skills for Exchange</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['JavaScript', 'React', 'Node.js', 'Python', 'Web Design'].map((skill) => (
                    <div key={skill} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-center">
                      {skill}
                    </div>
                  ))}
                  <button className="px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-center hover:border-blue-500 hover:text-blue-500 transition-colors">
                    + Add Skill
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/skill-exchange')}>
                    <FaExchangeAlt className="mr-2 h-4 w-4" /> Find Partners
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
                    <FaUsers className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/courses')}>
                    <FaStar className="mr-2 h-4 w-4" /> Browse Courses
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills I Want to Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Machine Learning', 'DevOps', 'UI/UX Design'].map((skill) => (
                    <div key={skill} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                      {skill}
                    </div>
                  ))}
                  <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-green-500 hover:text-green-500 transition-colors">
                    + Add Desired Skill
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkillExchangerDashboard;
