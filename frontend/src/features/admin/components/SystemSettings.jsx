import React, { useState } from 'react';
import { FaSave, FaCog, FaShieldAlt, FaBell, FaDatabase, FaCreditCard } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'SkillVerse',
    siteEmail: 'support@skillverse.com',
    maintenanceMode: false,
    debugMode: false,
    enableRegistration: true,
    enablePayments: true,
    stripePublicKey: 'pk_live_...',
    maxFileSize: 100,
    sessionTimeout: 30,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FaCog /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'database', label: 'Database', icon: <FaDatabase /> },
    { id: 'payments', label: 'Payments', icon: <FaCreditCard /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <Card>
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">General Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => handleChange('siteEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700">Enable Maintenance Mode</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableRegistration}
                    onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700">Allow New User Registration</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.debugMode}
                    onChange={(e) => handleChange('debugMode', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700">Debug Mode (Development Only)</span>
                </label>
              </div>

              <Button onClick={handleSave} variant="primary" icon={<FaSave />}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card>
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">Security Features</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✓ SSL/TLS Encryption Enabled</p>
                  <p>✓ Password Hashing: bcrypt</p>
                  <p>✓ Two-Factor Authentication: Available</p>
                  <p>✓ Rate Limiting: 100 requests/minute per IP</p>
                  <p>✓ CORS Protection: Enabled</p>
                </div>
              </div>

              <Button onClick={handleSave} variant="primary" icon={<FaSave />}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700">Email Notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700">SMS Notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700">Push Notifications</span>
                </label>
              </div>

              <Button onClick={handleSave} variant="primary" icon={<FaSave />}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* Database Settings */}
        {activeTab === 'database' && (
          <Card>
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Database Settings</h2>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Database Status</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Status: <span className="text-green-600 font-semibold">✓ Connected</span></p>
                  <p>Type: MongoDB 4.4.5</p>
                  <p>Host: mongodb.prod.local</p>
                  <p>Database: skillverse_prod</p>
                  <p>Tables: 12</p>
                  <p>Total Records: 156,842</p>
                  <p>Database Size: 2.3 GB</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full">
                  Export Data
                </Button>
                <Button variant="outline" className="w-full" onClick={() => toast.success('Optimization completed!')}>
                  Optimize Database
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Settings */}
        {activeTab === 'payments' && (
          <Card>
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Payment Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stripe Public Key</label>
                <input
                  type="password"
                  value={settings.stripePublicKey}
                  onChange={(e) => handleChange('stripePublicKey', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enablePayments}
                  onChange={(e) => handleChange('enablePayments', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700">Enable Payments</span>
              </label>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Methods Enabled</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>✓ Credit/Debit Cards (Stripe)</p>
                  <p>✓ PayPal Integration</p>
                  <p>✓ Apple Pay</p>
                  <p>✓ Google Pay</p>
                </div>
              </div>

              <Button onClick={handleSave} variant="primary" icon={<FaSave />}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
