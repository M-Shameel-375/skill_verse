import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaShareScreen, FaHand, FaEllipsisV, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getSessionById, joinLiveSession, leaveLiveSession, getSessionParticipants, getVideoConfig } from '../../../api/liveSessionApi';
import VideoCall from './VideoCall';

const SessionRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(true);
  const [videoConfig, setVideoConfig] = useState(null);
  const [useAgoraVideo, setUseAgoraVideo] = useState(false);

  const videoRef = useRef(null);

  const fetchSessionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch session details
      const sessionResponse = await getSessionById(sessionId);
      const sessionData = sessionResponse.data?.data || sessionResponse.data;
      setSession(sessionData);
      
      // Fetch video configuration to check if Agora is available
      try {
        const configResponse = await getVideoConfig(sessionId);
        const configData = configResponse.data?.data || configResponse.data;
        setVideoConfig(configData);
        setUseAgoraVideo(configData.videoEnabled);
      } catch (err) {
        console.log('Video config not available:', err.message);
        setUseAgoraVideo(false);
      }
      
      // Fetch participants
      try {
        const participantsResponse = await getSessionParticipants(sessionId);
        const participantsData = participantsResponse.data?.data || participantsResponse.data;
        setParticipants(Array.isArray(participantsData) ? participantsData : participantsData.participants || []);
      } catch (err) {
        // If participants API fails, use session data
        setParticipants(sessionData.participants || []);
      }
      
      // Join the session
      try {
        await joinLiveSession(sessionId);
      } catch (err) {
        // Ignore if already joined
        console.log('Join session:', err.response?.data?.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join session');
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();
    
    // Cleanup: Leave session when unmounting
    return () => {
      leaveLiveSession(sessionId).catch(console.error);
    };
  }, [fetchSessionData, sessionId]);

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

  const handleLeaveSession = async () => {
    if (window.confirm('Are you sure you want to leave the session?')) {
      try {
        await leaveLiveSession(sessionId);
        navigate('/live-sessions');
      } catch (err) {
        navigate('/live-sessions');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/live-sessions')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  // Get instructor info from session or first participant with instructor role
  const instructor = session?.instructor || participants.find(p => p.role === 'Instructor' || p.isInstructor) || { name: 'Instructor' };

  // Handle Agora Video Call leave
  const handleVideoCallLeave = () => {
    navigate('/live-sessions');
  };

  // If Agora video is enabled and configured, use the VideoCall component
  if (useAgoraVideo && videoConfig?.videoEnabled) {
    return (
      <VideoCall
        sessionId={sessionId}
        sessionTitle={session?.title}
        onLeave={handleVideoCallLeave}
      />
    );
  }

  // Check if session has an external meeting link
  const externalMeetingLink = session?.meetingLink || session?.externalLink;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* External meeting link banner */}
      {externalMeetingLink && (
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExternalLinkAlt />
            <span>This session uses an external meeting platform.</span>
          </div>
          <a
            href={externalMeetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition flex items-center gap-2"
          >
            <span>Join External Meeting</span>
            <FaExternalLinkAlt className="text-sm" />
          </a>
        </div>
      )}

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
                src={instructor.avatar || instructor.profileImage || `https://i.pravatar.cc/150?img=${instructor._id || 1}`}
                alt={instructor.name || 'Instructor'}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white"
              />
              <p className="text-white text-lg font-semibold">{instructor.name || 'Instructor'}</p>
              <span className="inline-block mt-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                🔴 Live
              </span>
            </div>

            {/* Participant overlay videos */}
            <div className="absolute top-4 right-4 space-y-2">
              {participants.slice(0, 3).map((participant) => (
                <div
                  key={participant._id || participant.id}
                  className="w-24 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center"
                >
                  <div className="text-center">
                    <img
                      src={participant.avatar || participant.profileImage || `https://i.pravatar.cc/150?img=${participant._id || participant.id || 1}`}
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
                <h2 className="text-2xl font-bold">{session?.title || 'Live Session'}</h2>
                <p className="text-sm opacity-75">{session?.status === 'live' ? 'Live now' : 'Session'} • {participants.length} participants</p>
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
                <div key={participant._id || participant.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                  <img
                    src={participant.avatar || participant.profileImage || `https://i.pravatar.cc/150?img=${participant._id || participant.id || 1}`}
                    alt={participant.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{participant.name}</p>
                    {participant.role && <p className="text-gray-400 text-xs">{participant.role}</p>}
                  </div>
                  {(participant.role === 'Instructor' || participant.isInstructor) && <span className="text-yellow-400 text-xs">★</span>}
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
