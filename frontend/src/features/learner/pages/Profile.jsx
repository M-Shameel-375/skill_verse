import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Tab } from '@headlessui/react';
import {
  FaEdit,
  FaMapMarkerAlt,
  FaCalendar,
  FaStar,
  FaCertificate,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaSpinner,
} from 'react-icons/fa';
import {
  getUserById,
  getUserCertificates,
  getUserBadges,
} from '@/api/userApi';
import useAuth from '@/hooks/useAuth';
import config from '@/config';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatDate = (date, format = 'MMM dd, yyyy') => {
  if (!date) return '';
  const d = new Date(date);
  const options = {
    'MMM dd, yyyy': { month: 'short', day: 'numeric', year: 'numeric' },
    'MMM yyyy': { month: 'short', year: 'numeric' },
  };
  return d.toLocaleDateString('en-US', options[format] || options['MMM dd, yyyy']);
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name) => {
  if (!name) return '#6366f1';
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// ============================================
// SKILL ITEM COMPONENT
// ============================================
const SkillItem = ({ skill }) => {
  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-red-100 text-red-800',
  };

  const skillName = typeof skill === 'string' ? skill : skill.name;
  const skillLevel = typeof skill === 'string' ? 'intermediate' : skill.level;
  const endorsements = typeof skill === 'object' ? skill.endorsements : 0;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{skillName}</h4>
        {skill.yearsOfExperience && (
          <p className="text-sm text-gray-600">
            {skill.yearsOfExperience} years experience
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {endorsements > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FaStar className="text-yellow-500" />
            <span>{endorsements}</span>
          </div>
        )}
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${levelColors[skillLevel] || levelColors.intermediate}`}>
          {skillLevel}
        </span>
      </div>
    </div>
  );
};

// ============================================
// CERTIFICATE CARD COMPONENT
// ============================================
const CertificateCard = ({ certificate }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
          <FaCertificate className="text-3xl text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1 truncate">
            {certificate.courseName || certificate.course?.title || 'Certificate'}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            Issued by {certificate.issuedBy || 'SkillVerse'}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(certificate.issuedAt || certificate.createdAt)}
          </p>
        </div>
        {certificate.url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(certificate.url, '_blank')}
          >
            View
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// ============================================
// BADGE CARD COMPONENT
// ============================================
const BadgeCard = ({ badge }) => {
  const badgeData = badge.badge || badge;

  return (
    <Card className="text-center">
      <CardContent className="p-6">
        <div className="text-5xl mb-3">
          {badgeData.icon?.url ? (
            <img src={badgeData.icon.url} alt={badgeData.name} className="w-12 h-12 mx-auto" />
          ) : (
            '🏆'
          )}
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">{badgeData.name}</h4>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{badgeData.description}</p>
        <p className="text-xs text-gray-500">
          Earned {formatDate(badge.earnedAt || badge.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
};

// ============================================
// PROFILE PAGE COMPONENT
// ============================================
const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : profile;

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const targetUserId = userId || currentUser?._id;
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      const [profileRes, certsRes, badgesRes] = await Promise.allSettled([
        !isOwnProfile ? getUserById(targetUserId) : Promise.resolve(null),
        getUserCertificates(targetUserId),
        getUserBadges(targetUserId),
      ]);

      // Set profile for other users
      if (!isOwnProfile && profileRes.status === 'fulfilled' && profileRes.value) {
        setProfile(profileRes.value?.data?.data || profileRes.value?.data);
      }

      // Set certificates
      if (certsRes.status === 'fulfilled') {
        const certsData = certsRes.value?.data?.data || certsRes.value?.data || [];
        setCertificates(Array.isArray(certsData) ? certsData : []);
      }

      // Set badges
      if (badgesRes.status === 'fulfilled') {
        const badgesData = badgesRes.value?.data?.data || badgesRes.value?.data || [];
        setBadges(Array.isArray(badgesData) ? badgesData : []);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser?._id, isOwnProfile]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error or no user
  if (error || !displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'User not found'}
          </h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const skills = displayUser.skills || displayUser.learnerProfile?.skills || [];

  return (
    <>
      <Helmet>
        <title>{displayUser.name} | {config.app?.name || 'SkillVerse'}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          {displayUser.coverImage?.url && (
            <img
              src={displayUser.coverImage.url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {displayUser.profileImage?.url ? (
                  <img
                    src={displayUser.profileImage.url}
                    alt={displayUser.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-white"
                    style={{ backgroundColor: getAvatarColor(displayUser.name) }}
                  >
                    {getInitials(displayUser.name)}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {displayUser.name}
                    </h1>
                    {displayUser.title && (
                      <p className="text-lg text-gray-600 mb-2">{displayUser.title}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      {(displayUser.location?.city || displayUser.location?.country) && (
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          <span>
                            {[displayUser.location.city, displayUser.location.country]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FaCalendar />
                        <span>Joined {formatDate(displayUser.createdAt, 'MMM yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      onClick={() => navigate('/settings')}
                    >
                      <FaEdit className="mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Bio */}
                {displayUser.bio && (
                  <p className="text-gray-700 mb-4">{displayUser.bio}</p>
                )}

                {/* Role Badge */}
                <span className="inline-block capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {displayUser.role || displayUser.activeRole || 'Learner'}
                </span>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {displayUser.learnerProfile?.completedCourses?.length ||
                        displayUser.coursesCompleted ||
                        0}
                    </div>
                    <div className="text-sm text-gray-600">Courses</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {certificates.length}
                    </div>
                    <div className="text-sm text-gray-600">Certificates</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {displayUser.gamification?.points || 0}
                    </div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {badges.length}
                    </div>
                    <div className="text-sm text-gray-600">Badges</div>
                  </div>
                </div>

                {/* Social Links */}
                {displayUser.socialLinks && (
                  <div className="flex items-center gap-3 mt-6">
                    {displayUser.socialLinks.linkedin && (
                      <a
                        href={displayUser.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <FaLinkedin className="text-xl" />
                      </a>
                    )}
                    {displayUser.socialLinks.github && (
                      <a
                        href={displayUser.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <FaGithub className="text-xl" />
                      </a>
                    )}
                    {displayUser.socialLinks.twitter && (
                      <a
                        href={displayUser.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-400 transition-colors"
                      >
                        <FaTwitter className="text-xl" />
                      </a>
                    )}
                    {displayUser.socialLinks.website && (
                      <a
                        href={displayUser.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <FaGlobe className="text-xl" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tab.Group>
            <Tab.List className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
              {['Skills', 'Certificates', 'Badges', 'Activity'].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `px-4 py-3 font-medium transition-colors whitespace-nowrap focus:outline-none ${selected
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {/* Skills Tab */}
              <Tab.Panel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <SkillItem key={index} skill={skill} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <div className="text-5xl mb-4">🎯</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No skills added yet
                      </h3>
                      {isOwnProfile && (
                        <Button onClick={() => navigate('/settings')}>
                          Add Skills
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Tab.Panel>

              {/* Certificates Tab */}
              <Tab.Panel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.length > 0 ? (
                    certificates.map((certificate) => (
                      <CertificateCard key={certificate._id} certificate={certificate} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <div className="text-5xl mb-4">📜</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No certificates yet
                      </h3>
                      {isOwnProfile && (
                        <Button onClick={() => navigate('/courses')}>
                          Browse Courses
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Tab.Panel>

              {/* Badges Tab */}
              <Tab.Panel>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {badges.length > 0 ? (
                    badges.map((badge) => (
                      <BadgeCard key={badge._id} badge={badge} />
                    ))
                  ) : (
                    <div className="col-span-4 text-center py-12">
                      <div className="text-5xl mb-4">🏆</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No badges earned yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Complete courses and challenges to earn badges
                      </p>
                    </div>
                  )}
                </div>
              </Tab.Panel>

              {/* Activity Tab */}
              <Tab.Panel>
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Activity Timeline
                  </h3>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </>
  );
};

export default Profile;