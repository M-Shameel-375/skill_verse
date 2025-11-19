import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaShareScreen, FaHand, FaEllipsisV } from 'react-icons/fa';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const SessionRoom = () => {
  const { sessionId } = useParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 1, name: 'John Instructor', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'You', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Alice Smith', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'Bob Johnson', avatar: 'https://i.pravatar.cc/150?img=4' },
  ]);
  const [showParticipants, setShowParticipants] = useState(true);

  const videoRef = useRef(null);

  useEffect(() => {
    // Initialize WebRTC connection
    console.log('Initializing session room for session:', sessionId);
  }, [sessionId]);

  const handleMicToggle = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Mic turned on' : 'Mic muted');
  };

  const handleVideoToggle = () => {
    setIsVideoOn(!isVideoOn);
    toast.success(isVideoOn ? 'Camera turned off' : 'Camera turned on');
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.success(isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing started');
  };

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    toast.success(handRaised ? 'Hand lowered' : 'Hand raised');
  };

  const handleLeaveSession = () => {
    if (window.confirm('Are you sure you want to leave the session?')) {
      window.location.href = '/live-sessions';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Main video area */}
      <div className="flex-1 flex gap-2 p-4 bg-gray-900">
        {/* Instructor video */}
        <div className="flex-1 relative bg-gray-800 rounded-lg overflow-hidden">
          <div
            ref={videoRef}
            className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center relative"
          >
            <div className="text-center">
              <img
                src="https://i.pravatar.cc/150?img=1"
                alt="Instructor"
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white"
              />
              <p className="text-white text-lg font-semibold">John Instructor</p>
              <span className="inline-block mt-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                🔴 Live
              </span>
            </div>

            {/* Participant overlay videos */}
            <div className="absolute top-4 right-4 space-y-2">
              {participants.slice(1, 3).map((participant) => (
                <div
                  key={participant.id}
                  className="w-24 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center"
                >
                  <div className="text-center">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Top info bar */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 flex justify-between items-center">
              <div className="text-white">
                <h2 className="text-2xl font-bold">React Hooks Deep Dive</h2>
                <p className="text-sm opacity-75">Started 5 mins ago • 24 participants</p>
              </div>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition"
              >
                👥 {participants.length}
              </button>
            </div>
          </div>
        </div>

        {/* Participants panel */}
        {showParticipants && (
          <div className="w-64 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-700 border-b border-gray-600">
              <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{participant.name}</p>
                    {participant.role && <p className="text-gray-400 text-xs">{participant.role}</p>}
                  </div>
                  {participant.role === 'Instructor' && <span className="text-yellow-400 text-xs">★</span>}
                </div>
              ))}
            </div>
          </div>
        )}
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
            onClick={handleRaiseHand}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition ${
              handRaised
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title="Raise hand"
          >
            <FaHand />
          </button>

          <div className="flex-1" />

          <button
            onClick={handleLeaveSession}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
            title="Leave session"
          >
            <FaPhone />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
