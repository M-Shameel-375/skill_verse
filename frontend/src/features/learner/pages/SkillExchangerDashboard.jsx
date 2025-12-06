import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@clerk/clerk-react';
import {
  FaExchangeAlt,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaHourglass,
  FaArrowRight,
  FaSpinner,
  FaPlus,
} from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMyExchanges, getPendingRequests, acceptExchangeRequest, rejectExchangeRequest } from '@/api/skillExchangeApi';
import toast from 'react-hot-toast';

// ============================================
// HELPER FUNCTIONS
// ============================================
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// ============================================
// STATS CARD COMPONENT
// ============================================
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
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
};

// ============================================
// REQUEST ITEM COMPONENT
// ============================================
const RequestItem = ({ request, onAccept, onReject, loading }) => {
  const fromUser = request.fromUser || request.requester || {};
  const skillOffered = request.skillOffered?.name || request.offeredSkill?.name || request.skill || 'Skill';
  const skillWanted = request.skillWanted?.name || request.wantedSkill?.name || request.mySkill || 'Skill';

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <img
          src={fromUser.profileImage?.url || `https://ui-avatars.com/api/?name=${fromUser.name || 'U'}`}
          alt={fromUser.name || 'User'}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h4 className="font-medium text-gray-900">{fromUser.name || 'Unknown User'}</h4>
          <p className="text-sm text-gray-600">
            Wants: <span className="font-medium text-blue-600">{skillWanted}</span> →
            Offers: <span className="font-medium text-green-600">{skillOffered}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onReject(request._id)}
          disabled={loading}
        >
          Decline
        </Button>
        <Button size="sm" onClick={() => onAccept(request._id)} disabled={loading}>
          {loading ? <FaSpinner className="animate-spin" /> : 'Accept'}
        </Button>
      </div>
    </div>
  );
};

// ============================================
// MY SKILLS CARD COMPONENT
// ============================================
const MySkillsCard = ({ skills, onAddSkill }) => {
  // Format skills array
  const formattedSkills = skills.map((skill) => {
    if (typeof skill === 'string') return skill;
    return skill.skill || skill.name || 'Skill';
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Skills for Exchange</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {formattedSkills.length > 0 ? (
            formattedSkills.map((skill, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-center font-medium"
              >
                {skill}
              </div>
            ))
          ) : (
            <p className="col-span-3 text-gray-500 text-center py-4">
              No skills added yet
            </p>
          )}
          <button
            onClick={onAddSkill}
            className="px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-center hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="h-3 w-3" />
            Add Skill
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// DESIRED SKILLS CARD COMPONENT
// ============================================
const DesiredSkillsCard = ({ skills, onAddSkill }) => {
  // Format skills array
  const formattedSkills = skills.map((skill) => {
    if (typeof skill === 'string') return skill;
    return skill.skill || skill.name || 'Skill';
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills I Want to Learn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {formattedSkills.length > 0 ? (
            formattedSkills.map((skill, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium"
              >
                {skill}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No skills added yet</p>
          )}
          <button
            onClick={onAddSkill}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-green-500 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="h-3 w-3" />
            Add Desired Skill
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// QUICK ACTIONS CARD COMPONENT
// ============================================
const QuickActionsCard = ({ navigate }) => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/skill-exchange')}
        >
          <FaExchangeAlt className="mr-2 h-4 w-4" />
          Find Partners
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/profile')}
        >
          <FaUsers className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/courses')}
        >
          <FaStar className="mr-2 h-4 w-4" />
          Browse Courses
        </Button>
      </div>
    </CardContent>
  </Card>
);

// ============================================
// SKILL EXCHANGER DASHBOARD COMPONENT
// ============================================
const SkillExchangerDashboard = ({ user: dbUser }) => {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    totalExchanges: 0,
    activeExchanges: 0,
    completedExchanges: 0,
    averageRating: 0,
  });
  const [pendingRequests, setPendingRequests] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [exchangesRes, requestsRes] = await Promise.allSettled([
        getMyExchanges(),
        getPendingRequests(),
      ]);

      // Process exchanges
      const exchanges =
        exchangesRes.status === 'fulfilled'
          ? exchangesRes.value?.data?.data?.exchanges ||
          exchangesRes.value?.data?.exchanges ||
          exchangesRes.value?.data?.data ||
          exchangesRes.value?.data ||
          []
          : [];

      // Calculate stats
      const active = exchanges.filter(
        (e) => e.status === 'active' || e.status === 'in-progress' || e.status === 'matched'
      ).length;
      const completed = exchanges.filter((e) => e.status === 'completed').length;
      const ratings = exchanges.filter((e) => e.rating).map((e) => e.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      setStats({
        totalExchanges: exchanges.length,
        activeExchanges: active,
        completedExchanges: completed,
        averageRating: avgRating.toFixed(1),
      });

      // Process pending requests
      const requests =
        requestsRes.status === 'fulfilled'
          ? requestsRes.value?.data?.data?.requests ||
          requestsRes.value?.data?.requests ||
          requestsRes.value?.data?.data ||
          requestsRes.value?.data ||
          []
          : [];

      setPendingRequests(
        requests.slice(0, 5).map((req) => ({
          _id: req._id,
          fromUser: req.fromUser || req.requester || { name: 'User' },
          skill: req.skillOffered?.name || req.offeredSkill?.name || 'Skill',
          mySkill: req.skillWanted?.name || req.wantedSkill?.name || 'Skill',
          status: req.status || 'pending',
          createdAt: req.createdAt,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle accept request
  const handleAccept = async (exchangeId) => {
    try {
      setActionLoading(true);
      await acceptExchangeRequest(exchangeId);
      toast.success('Exchange request accepted!');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to accept request:', error);
      toast.error('Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject request
  const handleReject = async (exchangeId) => {
    try {
      setActionLoading(true);
      await rejectExchangeRequest(exchangeId);
      toast.success('Exchange request declined');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to decline request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle add skill
  const handleAddSkill = () => {
    navigate('/profile/edit?tab=skills');
  };

  const userName = dbUser?.name || clerkUser?.firstName || 'Exchanger';
  const mySkills = dbUser?.exchangerProfile?.skillsToTeach || dbUser?.skills || [];
  const desiredSkills = dbUser?.exchangerProfile?.skillsToLearn || [];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Skill Exchange Dashboard | SkillVerse</title>
      </Helmet>

      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}! 🤝
            </h1>
            <p className="text-gray-600">Manage your skill exchanges and connect with others.</p>
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
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pending Requests</CardTitle>
                <Link
                  to="/skill-exchange"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm"
                >
                  View All <FaArrowRight />
                </Link>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📨</div>
                    <p className="text-gray-500">No pending requests</p>
                    <p className="text-sm text-gray-400 mt-1">
                      When someone wants to exchange skills with you, you'll see it here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <RequestItem
                        key={request._id}
                        request={request}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Skills */}
            <MySkillsCard skills={mySkills} onAddSkill={handleAddSkill} />
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <QuickActionsCard navigate={navigate} />

            {/* Desired Skills */}
            <DesiredSkillsCard skills={desiredSkills} onAddSkill={handleAddSkill} />

            {/* Find Partners CTA */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-semibold text-gray-900 mb-2">Find Exchange Partners</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Discover people who want to learn what you know and teach what you want to learn
                </p>
                <Button onClick={() => navigate('/skill-exchange')} className="w-full">
                  Browse Matches
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkillExchangerDashboard;