// ============================================
// ROLE SELECTION PAGE
// ============================================
// This page allows users to select their role after signing up

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaExchangeAlt,
  FaCheck,
  FaArrowRight,
} from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// ============================================
// ROLE OPTIONS
// ============================================
const roleOptions = [
  {
    id: 'learner',
    title: 'Learner',
    description: 'Browse courses, learn new skills, earn certificates',
    icon: FaGraduationCap,
    color: 'blue',
    features: [
      'Access to all courses',
      'Track learning progress',
      'Earn certificates & badges',
      'Join live sessions',
      'Take quizzes & assessments',
    ],
  },
  {
    id: 'educator',
    title: 'Educator',
    description: 'Create courses, teach students, earn money',
    icon: FaChalkboardTeacher,
    color: 'green',
    features: [
      'Create & publish courses',
      'Host live teaching sessions',
      'Monetize your expertise',
      'Track student analytics',
      'Issue certificates',
    ],
  },
  {
    id: 'skillExchanger',
    title: 'Skill Exchanger',
    description: 'Exchange skills with peers, learn from others',
    icon: FaExchangeAlt,
    color: 'purple',
    features: [
      'List skills to offer',
      'Find skill matches',
      'Schedule exchange sessions',
      'Chat with partners',
      'Earn endorsements',
    ],
  },
];

// ============================================
// ROLE CARD COMPONENT
// ============================================
const RoleCard = ({ role, isSelected, onSelect }) => {
  const Icon = role.icon;
  
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: 'text-blue-600',
      check: 'bg-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: 'text-green-600',
      check: 'bg-green-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-500',
      icon: 'text-purple-600',
      check: 'bg-purple-600',
    },
  };

  const colors = colorClasses[role.color];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(role.id)}
      className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${
        isSelected
          ? `${colors.border} ${colors.bg} shadow-lg`
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Selected Checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -top-3 -right-3 w-8 h-8 ${colors.check} rounded-full flex items-center justify-center shadow-lg`}
        >
          <FaCheck className="text-white text-sm" />
        </motion.div>
      )}

      {/* Icon */}
      <div className={`w-16 h-16 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
        <Icon className={`text-3xl ${colors.icon}`} />
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
      <p className="text-gray-600 mb-4">{role.description}</p>

      {/* Features */}
      <ul className="space-y-2">
        {role.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <FaCheck className={`text-xs ${colors.icon}`} />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// ============================================
// ROLE SELECTION PAGE COMPONENT
// ============================================
const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // HANDLE ROLE SELECTION
  // ============================================
  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select a role to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call backend API to update user role
      const response = await fetch('http://localhost:5000/api/v1/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          name: user?.fullName || user?.firstName,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      const data = await response.json();

      // Save user data to localStorage
      localStorage.setItem('skillverse_user', JSON.stringify(data.data));
      localStorage.setItem('skillverse_user_role', selectedRole);

      toast.success(`Welcome! You're now registered as a ${selectedRole}`);

      // Redirect to dashboard (SmartDashboard will show the correct view)
      navigate('/dashboard');
    } catch (error) {
      console.error('Role selection error:', error);
      toast.error('Failed to set role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <Helmet>
        <title>Choose Your Role | SkillVerse</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to SkillVerse! 🎉
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose how you want to use the platform. Don't worry, you can always change this later!
            </p>
          </motion.div>

          {/* Role Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {roleOptions.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                isSelected={selectedRole === role.id}
                onSelect={setSelectedRole}
              />
            ))}
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || isSubmitting}
              className="px-8 py-4 text-lg font-semibold"
            >
              {isSubmitting ? (
                'Setting up...'
              ) : (
                <>
                  Continue as {selectedRole ? roleOptions.find(r => r.id === selectedRole)?.title : '...'} 
                  <FaArrowRight className="ml-2" />
                </>
              )}
            </Button>

            <p className="mt-4 text-sm text-gray-500">
              You can change your role anytime from your profile settings
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RoleSelection;
