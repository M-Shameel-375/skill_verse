// ============================================
// MEETING LINK SETUP COMPONENT
// ============================================

import React, { useState } from 'react';
import { 
  FaVideo, 
  FaLink, 
  FaCheck, 
  FaSpinner,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { 
  SiZoom, 
  SiGooglemeet, 
  SiMicrosoftteams, 
  SiDiscord,
  SiSkype,
} from 'react-icons/si';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { setMeetingLink, createMeetingRoom, getVideoServiceStatus } from '@/api/liveSessionApi';
import toast from 'react-hot-toast';

// Platform options
const PLATFORMS = [
  { id: 'zoom', name: 'Zoom', icon: SiZoom, color: 'text-blue-500', placeholder: 'https://zoom.us/j/...' },
  { id: 'google-meet', name: 'Google Meet', icon: SiGooglemeet, color: 'text-green-500', placeholder: 'https://meet.google.com/...' },
  { id: 'teams', name: 'MS Teams', icon: SiMicrosoftteams, color: 'text-purple-500', placeholder: 'https://teams.microsoft.com/...' },
  { id: 'discord', name: 'Discord', icon: SiDiscord, color: 'text-indigo-500', placeholder: 'https://discord.gg/...' },
  { id: 'skype', name: 'Skype', icon: SiSkype, color: 'text-sky-500', placeholder: 'https://join.skype.com/...' },
  { id: 'custom', name: 'Custom Link', icon: FaLink, color: 'text-gray-500', placeholder: 'https://...' },
];

const MeetingLinkSetup = ({ sessionId, currentLink, onLinkSet }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('zoom');
  const [meetingUrl, setMeetingUrl] = useState(currentLink || '');
  const [saving, setSaving] = useState(false);
  const [checkingAgora, setCheckingAgora] = useState(false);
  const [agoraAvailable, setAgoraAvailable] = useState(null);

  // Check if Agora is configured
  const checkAgoraStatus = async () => {
    try {
      setCheckingAgora(true);
      const res = await getVideoServiceStatus();
      const status = res.data?.data || res.data;
      setAgoraAvailable(status.configured);
      return status.configured;
    } catch (err) {
      console.error('Agora check error:', err);
      setAgoraAvailable(false);
      return false;
    } finally {
      setCheckingAgora(false);
    }
  };

  // Use built-in Agora video
  const handleUseAgora = async () => {
    try {
      setSaving(true);
      const isAvailable = await checkAgoraStatus();
      
      if (!isAvailable) {
        toast.error('Built-in video is not configured. Please use an external meeting link.');
        return;
      }

      await createMeetingRoom(sessionId);
      toast.success('Meeting room created with built-in video!');
      onLinkSet?.({ platform: 'agora', isBuiltIn: true });
    } catch (err) {
      console.error('Agora setup error:', err);
      toast.error(err.response?.data?.message || 'Failed to create meeting room');
    } finally {
      setSaving(false);
    }
  };

  // Save external meeting link
  const handleSaveLink = async () => {
    if (!meetingUrl.trim()) {
      toast.error('Please enter a meeting link');
      return;
    }

    // Basic URL validation
    try {
      new URL(meetingUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      setSaving(true);
      await setMeetingLink(sessionId, meetingUrl.trim(), selectedPlatform);
      toast.success('Meeting link saved successfully!');
      onLinkSet?.({ 
        platform: selectedPlatform, 
        meetingLink: meetingUrl.trim(),
        isBuiltIn: false 
      });
    } catch (err) {
      console.error('Save link error:', err);
      toast.error(err.response?.data?.message || 'Failed to save meeting link');
    } finally {
      setSaving(false);
    }
  };

  const selectedPlatformInfo = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaVideo className="text-blue-500" />
          Meeting Setup
        </CardTitle>
        <CardDescription>
          Configure how participants will join your live session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Built-in Video Option */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Built-in Video (Agora)</h4>
              <p className="text-sm text-gray-600 mt-1">
                Use our integrated video conferencing system. No external links needed.
              </p>
              {agoraAvailable === false && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Built-in video is not configured on this platform.
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleUseAgora}
              disabled={saving || checkingAgora}
            >
              {checkingAgora ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaVideo className="mr-2" />
              )}
              Use Built-in
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or use external platform</span>
          </div>
        </div>

        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platform
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatform === platform.id;
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`text-2xl ${isSelected ? platform.color : 'text-gray-400'}`} />
                  <span className={`text-xs mt-1 ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {platform.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Meeting Link Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Link
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLink className="text-gray-400" />
              </div>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder={selectedPlatformInfo?.placeholder || 'https://...'}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              onClick={handleSaveLink}
              disabled={saving || !meetingUrl.trim()}
            >
              {saving ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCheck className="mr-2" />
              )}
              Save
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Participants will use this link to join your session
          </p>
        </div>

        {/* Current Link Preview */}
        {currentLink && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-500" />
                <span className="text-sm text-green-700">Meeting link configured</span>
              </div>
              <a
                href={currentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm"
              >
                Test Link <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
            <p className="text-xs text-green-600 mt-1 truncate">{currentLink}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingLinkSetup;
