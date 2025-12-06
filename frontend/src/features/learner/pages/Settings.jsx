import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@clerk/clerk-react';
import {
  FaUser,
  FaLock,
  FaBell,
  FaTrash,
  FaUpload,
  FaSpinner,
} from 'react-icons/fa';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import {
  getUserProfile,
  updateProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteAccount,
} from '@/api/userApi';

// ============================================
// TAB BUTTON COMPONENT
// ============================================
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${active
        ? 'text-blue-600 border-blue-600'
        : 'text-gray-600 hover:text-gray-900 border-transparent'
      }`}
  >
    <Icon />
    {label}
  </button>
);

// ============================================
// ACCOUNT SETTINGS TAB
// ============================================
const AccountSettings = ({ user, dbUser, onUpdate }) => {
  const [imagePreview, setImagePreview] = useState(
    dbUser?.profileImage?.url || user?.imageUrl || null
  );
  const [formData, setFormData] = useState({
    name: dbUser?.name || user?.fullName || '',
    email: dbUser?.email || user?.primaryEmailAddress?.emailAddress || '',
    phone: dbUser?.phone || '',
    bio: dbUser?.bio || '',
    title: dbUser?.title || '',
    city: dbUser?.location?.city || '',
    country: dbUser?.location?.country || '',
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Update form when dbUser changes
  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || user?.fullName || '',
        email: dbUser.email || user?.primaryEmailAddress?.emailAddress || '',
        phone: dbUser.phone || '',
        bio: dbUser.bio || '',
        title: dbUser.title || '',
        city: dbUser.location?.city || '',
        country: dbUser.location?.country || '',
      });
      setImagePreview(dbUser.profileImage?.url || user?.imageUrl || null);
    }
  }, [dbUser, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('phone', formData.phone);
      updateData.append('bio', formData.bio);
      updateData.append('title', formData.title);
      updateData.append('location', JSON.stringify({
        city: formData.city,
        country: formData.country,
      }));

      if (imageFile) {
        updateData.append('profileImage', imageFile);
      }

      await updateProfile(updateData);
      toast.success('Profile updated successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div>
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-6 mt-2">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
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
                  <span className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <FaUpload />
                    Upload Photo
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email is managed by authentication provider
            </p>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Professional Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Senior Web Developer"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 resize-none"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// ============================================
// SECURITY SETTINGS TAB
// ============================================
const SecuritySettings = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      toast.success('Account deletion request submitted');
      // Redirect to home or logout
      window.location.href = '/';
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Info */}
      <Card>
        <CardHeader>
          <CardTitle>Password & Security</CardTitle>
          <CardDescription>
            Manage your security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Your password and security settings are managed through your authentication provider.
          </p>
          <Button
            variant="outline"
            onClick={() => window.open('https://accounts.clerk.dev/user', '_blank')}
          >
            <FaLock className="mr-2" />
            Manage Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <FaTrash className="mr-2" />
            Delete Account
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Account?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your data, courses, certificates, and progress will be permanently deleted.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// NOTIFICATION SETTINGS TAB
// ============================================
const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    courseUpdates: true,
    skillExchangeRequests: true,
    messages: true,
    promotions: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await getNotificationPreferences();
        const data = response?.data?.data || response?.data;
        if (data) {
          setPreferences((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleToggle = async (key) => {
    const newValue = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: newValue }));

    try {
      setSaving(true);
      await updateNotificationPreferences({ [key]: newValue });
      toast.success('Preferences updated');
    } catch (error) {
      // Revert on error
      setPreferences((prev) => ({ ...prev, [key]: !newValue }));
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser' },
    { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
    { key: 'courseUpdates', label: 'Course Updates', description: 'Get notified about course updates' },
    { key: 'skillExchangeRequests', label: 'Skill Exchange', description: 'Get notified about exchange requests' },
    { key: 'messages', label: 'Messages', description: 'Get notified about new messages' },
    { key: 'promotions', label: 'Promotions', description: 'Receive promotional emails' },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Control how you receive notifications</CardDescription>
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
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${preferences[type.key] ? 'bg-blue-600' : 'bg-gray-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences[type.key] ? 'translate-x-5' : 'translate-x-0'
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
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('account');
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      const response = await getUserProfile();
      setDbUser(response?.data?.data || response?.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const tabs = [
    { id: 'account', icon: FaUser, label: 'Account' },
    { id: 'security', icon: FaLock, label: 'Security' },
    { id: 'notifications', icon: FaBell, label: 'Notifications' },
  ];

  return (
    <>
      <Helmet>
        <title>Settings | SkillVerse</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {loading && activeTab === 'account' ? (
            <Card>
              <CardContent className="p-6 flex items-center justify-center">
                <FaSpinner className="animate-spin text-2xl text-blue-600" />
              </CardContent>
            </Card>
          ) : (
            <>
              {activeTab === 'account' && (
                <AccountSettings
                  user={user}
                  dbUser={dbUser}
                  onUpdate={fetchProfile}
                />
              )}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;