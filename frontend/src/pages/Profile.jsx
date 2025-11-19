import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Tab } from '@headlessui/react';
import {
  FaEdit,
  FaMapMarkerAlt,
  FaCalendar,
  FaStar,
  FaTrophy,
  FaCertificate,
  FaBook,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaEnvelope,
} from 'react-icons/fa';
import {
  getUserProfile,
  getUserCertificates,
  getUserBadges,
  selectUserProfile,
  selectUserCertificates,
  selectUserBadges,
  selectUserLoading,
} from '../redux/slices/userSlice';
import useAuth from '../hooks/useAuth';
import config from '../config';
import Card, { CardBadge } from '../components/common/Card';
import Button from '../components/common/Button';
import { FullPageLoader, SkeletonLoader } from '../components/common/Loader';
import { formatDate, getInitials, getAvatarColor } from '../utils/helpers';

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

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{skill.name}</h4>
        {skill.yearsOfExperience && (
          <p className="text-sm text-gray-600">
            {skill.yearsOfExperience} years experience
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {skill.endorsements > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FaStar className="text-yellow-500" />
            <span>{skill.endorsements}</span>
          </div>
        )}
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${levelColors[skill.level]}`}>
          {skill.level}
        </span>
      </div>
    </div>
  );
};

// ============================================
// CERTIFICATE CARD COMPONENT
// ============================================
const CertificateCard = ({ certificate }) => {
  return (
    <Card hoverable>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FaCertificate className="text-3xl text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {certificate.courseName}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Issued by {certificate.issuedBy}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(certificate.issuedAt)}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(certificate.url, '_blank')}
          >
            View
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ============================================
// BADGE CARD COMPONENT
// ============================================
const BadgeCard = ({ badge }) => {
  return (
    <Card className="text-center">
      <div className="p-6">
        <div className="text-5xl mb-3">{badge.icon}</div>
        <h4 className="font-semibold text-gray-900 mb-1">{badge.name}</h4>
        <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
        <p className="text-xs text-gray-500">
          Earned on {formatDate(badge.earnedAt)}
        </p>
      </div>
    </Card>
  );
};

// ============================================
// PROFILE PAGE COMPONENT
// ============================================
const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const profile = useSelector(selectUserProfile);
  const certificates = useSelector(selectUserCertificates);
  const badges = useSelector(selectUserBadges);
  const loading = useSelector(selectUserLoading);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : profile;

  // ============================================
  // FETCH DATA
  // ============================================
  useEffect(() => {
    const targetUserId = userId || currentUser?._id;
    if (targetUserId) {
      if (!isOwnProfile) {
        dispatch(getUserProfile(targetUserId));
      }
      dispatch(getUserCertificates(targetUserId));
      dispatch(getUserBadges(targetUserId));
    }
  }, [dispatch, userId, currentUser, isOwnProfile]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !displayUser) {
    return <FullPageLoader message="Loading profile..." />;
  }

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{displayUser.name} | {config.app.name}</title>
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
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
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
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {displayUser.name}
                    </h1>
                    {displayUser.title && (
                      <p className="text-lg text-gray-600 mb-2">{displayUser.title}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {displayUser.location?.city && (
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          <span>{displayUser.location.city}, {displayUser.location.country}</span>
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
                      icon={<FaEdit />}
                      onClick={() => navigate('/profile/edit')}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Bio */}
                {displayUser.bio && (
                  <p className="text-gray-700 mb-4">{displayUser.bio}</p>
                )}

                {/* Role Badge */}
                <CardBadge variant="primary" className="capitalize">
                  {displayUser.role}
                </CardBadge>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {displayUser.learnerProfile?.completedCourses?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Courses</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {certificates.length}
                    </div>
                    <div className="text-sm text-gray-600">Certificates</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {displayUser.gamification?.points || 0}
                    </div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  
                  <div className="text-center">
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
            <Tab.List className="flex gap-4 border-b border-gray-200 mb-8">
              {['Skills', 'Certificates', 'Badges', 'Activity'].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `px-4 py-3 font-medium transition-colors ${
                      selected
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
                  {displayUser.skills && displayUser.skills.length > 0 ? (
                    displayUser.skills.map((skill, index) => (
                      <SkillItem key={index} skill={skill} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <div className="text-5xl mb-4">🎯</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No skills added yet
                      </h3>
                      {isOwnProfile && (
                        <Button onClick={() => navigate('/profile/edit')}>
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
                        <Button onClick={() => navigate(config.routes.courses)}>
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
                  <p className="text-gray-600">
                    Coming soon...
                  </p>
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