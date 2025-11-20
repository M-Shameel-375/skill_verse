// ============================================
// SETTINGS PAGE
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Tab } from '@headlessui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  FaUser,
  FaLock,
  FaBell,
  FaShieldAlt,
  FaTrash,
  FaSave,
  FaUpload,
} from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  selectNotificationPreferences,
  selectPreferencesLoading,
} from '../../../redux/slices/notificationSlice';
import config from '../../../config';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Button } from '../../../components/ui/Button';
import Modal, { DeleteConfirmModal } from '../../shared/components/Modal';
import { InlineLoader } from '../../shared/components/Loader';
import toast from 'react-hot-toast';

// ============================================
// VALIDATION SCHEMAS
// ============================================
const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  bio: Yup.string()
    .max(500, 'Bio cannot exceed 500 characters'),
  title: Yup.string()
    .max(100, 'Title cannot exceed 100 characters'),
});

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

// ============================================
// ACCOUNT SETTINGS TAB
// ============================================
const AccountSettings = () => {
  const { user, updateProfile, loading } = useAuth();
  const [imagePreview, setImagePreview] = useState(user?.profileImage?.url || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // TODO: Upload image
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateProfile({
        name: values.name,
        email: values.email,
        phone: values.phone,
        bio: values.bio,
        title: values.title,
        location: {
          city: values.city,
          country: values.country,
        },
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            bio: user?.bio || '',
            title: user?.title || '',
            city: user?.location?.city || '',
            country: user?.location?.country || '',
          }}
          validationSchema={profileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-6">
              {/* Profile Image */}
              <div>
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-6 mt-2">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <label htmlFor="profile-image">
                      <Button
                        as="span"
                        variant="outline"
                        icon={<FaUpload />}
                      >
                        Upload Photo
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Field
                  id="name"
                  name="name"
                  as={Input}
                  className={`${touched.name && errors.name ? 'border-red-500' : ''}`}
                />
                <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  as={Input}
                  className={`${touched.email && errors.email ? 'border-red-500' : ''}`}
                />
                <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  as={Input}
                  placeholder="e.g., Senior Web Developer"
                  className={`${touched.title && errors.title ? 'border-red-500' : ''}`}
                />
                <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-600" />
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Field
                  id="bio"
                  name="bio"
                  as="textarea"
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    touched.bio && errors.bio ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Tell us a bit about yourself..."
                />
                <ErrorMessage name="bio" component="p" className="mt-1 text-sm text-red-600" />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Field
                    id="city"
                    name="city"
                    type="text"
                    as={Input}
                    className={`${touched.city && errors.city ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="city" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Field
                    id="country"
                    name="country"
                    type="text"
                    as={Input}
                    className={`${touched.country && errors.country ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="country" component="p" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4">
                <Button type="submit" loading={isSubmitting} icon={<FaSave />}>
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

// ============================================
// SECURITY SETTINGS TAB
// ============================================
const SecuritySettings = () => {
  const { changePassword } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success('Password changed successfully!');
      resetForm();
    } catch (error) {
      toast.error(error || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            validationSchema={passwordSchema}
            onSubmit={handlePasswordChange}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form className="space-y-6">
                {/* Current Password */}
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Field
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    as={Input}
                    className={`${touched.currentPassword && errors.currentPassword ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="currentPassword" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                {/* New Password */}
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Field
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    as={Input}
                    className={`${touched.newPassword && errors.newPassword ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="newPassword" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    as={Input}
                    className={`${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<FaLock />}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Update Password
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>
            Once you delete your account, there is no going back. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="danger"
            icon={<FaTrash />}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          // Handle account deletion
          toast.success('Account deletion request submitted');
          setShowDeleteModal(false);
        }}
        itemName="your account"
      />
    </div>
  );
};

// ============================================
// NOTIFICATION SETTINGS TAB
// ============================================
const NotificationSettings = () => {
  const dispatch = useDispatch();
  const preferences = useSelector(selectNotificationPreferences);
  const loading = useSelector(selectPreferencesLoading);

  useEffect(() => {
    dispatch(getNotificationPreferences());
  }, [dispatch]);

  const handleToggle = async (key) => {
    try {
      await dispatch(updateNotificationPreferences({
        ...preferences,
        [key]: !preferences[key],
      })).unwrap();
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const notificationTypes = [
    { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser' },
    { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
    { key: 'courseUpdates', label: 'Course Updates', description: 'Get notified about course updates and new content' },
    { key: 'skillExchangeRequests', label: 'Skill Exchange Requests', description: 'Get notified about new skill exchange requests' },
    { key: 'messages', label: 'Messages', description: 'Get notified about new messages' },
    { key: 'promotions', label: 'Promotions & Offers', description: 'Receive promotional emails and special offers' },
  ];

  if (loading && !preferences) {
    return <InlineLoader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {notificationTypes.map((type) => (
            <div key={type.key} className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{type.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </div>
              
              <button
                onClick={() => handleToggle(type.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  preferences[type.key] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences[type.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// SETTINGS PAGE COMPONENT
// ============================================
const Settings = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Settings | {config.app.name}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <Tab.Group>
          <Tab.List className="flex gap-4 border-b border-gray-200">
            {[
              { icon: FaUser, label: 'Account' },
              { icon: FaLock, label: 'Security' },
              { icon: FaBell, label: 'Notifications' },
            ].map((tab) => (
              <Tab
                key={tab.label}
                className={({ selected }) =>
                  `flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    selected
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <tab.icon />
                {tab.label}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-6">
            <Tab.Panel>
              <AccountSettings />
            </Tab.Panel>
            
            <Tab.Panel>
              <SecuritySettings />
            </Tab.Panel>
            
            <Tab.Panel>
              <NotificationSettings />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
};

export default Settings;