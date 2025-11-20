import React, { useState, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaShareScreen, FaMessage } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import toast from 'react-hot-toast';

const VideoChat = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState('12:34');
  const videoRef = useRef(null);

  const handleMicToggle = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Mic on' : 'Muted');
  };

  const handleVideoToggle = () => {
    setIsVideoOn(!isVideoOn);
    toast.success(isVideoOn ? 'Camera off' : 'Camera on');
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.success(isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing started');
  };

  const handleEndCall = () => {
    if (window.confirm('End this video call?')) {
      window.history.back();
    }
  };

  const handleMessage = () => {
    toast.success('Opening chat...');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Main video area */}
      <div className="flex-1 flex gap-2 p-4">
        {/* Remote video */}
        <div className="flex-1 relative bg-gray-800 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center relative">
            <div className="text-center">
              <img
                src="https://i.pravatar.cc/150?img=5"
                alt="Sarah Lee"
                className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-white"
              />
              <p className="text-white text-2xl font-semibold">Sarah Lee</p>
              <p className="text-green-200 text-sm mt-2">Python Expert</p>
            </div>

            {/* Top bar - Call info */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 flex justify-between items-center">
              <div className="text-white">
                <h2 className="text-xl font-bold">Skill Exchange Session</h2>
                <p className="text-sm opacity-75">{callDuration}</p>
              </div>
            </div>

            {/* Local video preview */}
            <div className="absolute bottom-4 right-4 w-32 h-40 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center">
              {isVideoOn ? (
                <img
                  src="https://i.pravatar.cc/150?img=2"
                  alt="You"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <FaVideoSlash size={24} className="mx-auto" />
                  <p className="text-xs mt-2">Camera Off</p>
                </div>
              )}
            </div>

            {/* Screen share indicator */}
            {isScreenSharing && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                🖥️ Sharing Screen
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex justify-center items-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={handleMicToggle}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>

          <button
            onClick={handleVideoToggle}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition ${
              !isVideoOn
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isVideoOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
          </button>

          <button
            onClick={handleScreenShare}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title="Share screen"
          >
            <FaShareScreen />
          </button>

          <button
            onClick={handleMessage}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
            title="Send message"
          >
            <FaMessage />
          </button>

          <div className="flex-1" />

          <button
            onClick={handleEndCall}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
            title="End call"
          >
            <FaPhone />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
