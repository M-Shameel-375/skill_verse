// ============================================
// VIDEO CALL COMPONENT (Agora Integration)
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaPhone, 
  FaDesktop, 
  FaHandPaper,
  FaExternalLinkAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaUsers,
  FaCopy,
} from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getAgoraToken, getVideoServiceStatus } from '@/api/liveSessionApi';
import toast from 'react-hot-toast';

// ============================================
// VIDEO CALL COMPONENT
// ============================================
const VideoCall = ({ 
  sessionId, 
  sessionTitle,
  isHost = false,
  meetingLink = null,
  onLeave,
  onError,
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [participants, setParticipants] = useState([]);
  
  // Refs for Agora
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audio: null, video: null });
  const localPlayerRef = useRef(null);
  const remotePlayersRef = useRef({});

  // Fetch video token and status
  const initializeVideo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get video service status
      const statusRes = await getVideoServiceStatus();
      const status = statusRes.data?.data || statusRes.data;
      setVideoStatus(status);

      // Get video token for session
      const tokenRes = await getAgoraToken(sessionId);
      const token = tokenRes.data?.data || tokenRes.data;
      setTokenInfo(token);

      // Check if we should use fallback
      if (token.useFallback || !status.configured) {
        console.log('Video service not configured, using fallback mode');
        setLoading(false);
        return;
      }

      // Initialize Agora client if configured
      if (token.token && status.configured) {
        await initializeAgoraClient(token);
      }

    } catch (err) {
      console.error('Video initialization error:', err);
      setError(err.response?.data?.message || 'Failed to initialize video');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, onError]);

  // Initialize Agora RTC Client
  const initializeAgoraClient = async (token) => {
    try {
      // Dynamic import of Agora SDK
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      
      // Create client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Set up event handlers
      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-joined', handleUserJoined);
      client.on('user-left', handleUserLeft);

      // Join channel
      await client.join(token.appId, token.channel, token.token, token.uid || null);
      
      // Create and publish local tracks if host
      if (isHost) {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audio: audioTrack, video: videoTrack };
        
        // Play local video
        if (localPlayerRef.current) {
          videoTrack.play(localPlayerRef.current);
        }
        
        // Publish tracks
        await client.publish([audioTrack, videoTrack]);
      }

      setIsConnected(true);
      toast.success('Connected to video session');
    } catch (err) {
      console.error('Agora initialization error:', err);
      setError('Failed to connect to video. Using fallback mode.');
    }
  };

  // Agora event handlers
  const handleUserPublished = async (user, mediaType) => {
    await clientRef.current?.subscribe(user, mediaType);
    
    if (mediaType === 'video') {
      const remotePlayer = document.getElementById(`remote-player-${user.uid}`);
      if (remotePlayer) {
        user.videoTrack?.play(remotePlayer);
      }
    }
    
    if (mediaType === 'audio') {
      user.audioTrack?.play();
    }
    
    setParticipants(prev => {
      if (!prev.find(p => p.uid === user.uid)) {
        return [...prev, { uid: user.uid, hasVideo: mediaType === 'video', hasAudio: mediaType === 'audio' }];
      }
      return prev.map(p => p.uid === user.uid ? { ...p, [`has${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`]: true } : p);
    });
  };

  const handleUserUnpublished = (user, mediaType) => {
    setParticipants(prev => 
      prev.map(p => p.uid === user.uid ? { ...p, [`has${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`]: false } : p)
    );
  };

  const handleUserJoined = (user) => {
    setParticipants(prev => {
      if (!prev.find(p => p.uid === user.uid)) {
        return [...prev, { uid: user.uid, hasVideo: false, hasAudio: false }];
      }
      return prev;
    });
    toast.success('A participant joined');
  };

  const handleUserLeft = (user) => {
    setParticipants(prev => prev.filter(p => p.uid !== user.uid));
    toast.info('A participant left');
  };

  // Control handlers
  const toggleMute = async () => {
    if (localTracksRef.current.audio) {
      await localTracksRef.current.audio.setEnabled(isMuted);
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    }
  };

  const toggleVideo = async () => {
    if (localTracksRef.current.video) {
      await localTracksRef.current.video.setEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
      toast.success(isVideoOn ? 'Camera turned off' : 'Camera turned on');
    }
  };

  const toggleScreenShare = async () => {
    if (!clientRef.current) return;
    
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (localTracksRef.current.screen) {
          localTracksRef.current.screen.close();
          localTracksRef.current.screen = null;
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        const screenTrack = await AgoraRTC.createScreenVideoTrack();
        localTracksRef.current.screen = screenTrack;
        await clientRef.current.publish(screenTrack);
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Screen share error:', err);
      toast.error('Failed to share screen');
    }
  };

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    toast.success(handRaised ? 'Hand lowered' : 'Hand raised');
    // TODO: Emit socket event for hand raise
  };

  const handleLeave = async () => {
    try {
      // Clean up Agora
      if (localTracksRef.current.audio) {
        localTracksRef.current.audio.close();
      }
      if (localTracksRef.current.video) {
        localTracksRef.current.video.close();
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
    } catch (err) {
      console.error('Leave error:', err);
    }
    
    onLeave?.();
  };

  const copyMeetingLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      toast.success('Meeting link copied!');
    }
  };

  const openExternalLink = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeVideo();
    
    return () => {
      // Cleanup
      handleLeave();
    };
  }, [initializeVideo]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900 rounded-lg">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <p className="text-white">Connecting to video session...</p>
      </div>
    );
  }

  // Fallback mode (external meeting link)
  if (tokenInfo?.useFallback || !videoStatus?.configured) {
    return (
      <Card className="bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            Video Service Not Configured
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            The built-in video service is not configured. 
            {meetingLink ? ' Use the external meeting link below:' : ' Please set up an external meeting link.'}
          </p>
          
          {meetingLink ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                <input 
                  type="text" 
                  value={meetingLink} 
                  readOnly 
                  className="flex-1 bg-transparent text-white outline-none"
                />
                <Button variant="ghost" size="sm" onClick={copyMeetingLink}>
                  <FaCopy />
                </Button>
              </div>
              
              <Button 
                className="w-full" 
                onClick={openExternalLink}
              >
                <FaExternalLinkAlt className="mr-2" />
                Open Meeting Link
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                No meeting link available. The host needs to set up a meeting link 
                (Zoom, Google Meet, etc.) for this session.
              </p>
            </div>
          )}

          {isHost && (
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">
                As the host, you can set up an external meeting link in the session settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Connected video UI
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Grid */}
      <div className="relative aspect-video bg-black">
        {/* Local Video */}
        <div 
          ref={localPlayerRef}
          className={`absolute ${participants.length > 0 ? 'bottom-4 right-4 w-48 h-36' : 'inset-0'} bg-gray-800 rounded-lg overflow-hidden`}
        >
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-2xl text-white">You</span>
              </div>
            </div>
          )}
        </div>

        {/* Remote Videos */}
        <div className="grid grid-cols-2 gap-2 p-2">
          {participants.map((participant) => (
            <div 
              key={participant.uid}
              id={`remote-player-${participant.uid}`}
              className="aspect-video bg-gray-800 rounded-lg overflow-hidden"
            >
              {!participant.hasVideo && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white">P{participant.uid}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Session Title Overlay */}
        <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
          <span className="text-white text-sm">{sessionTitle}</span>
        </div>

        {/* Participants Count */}
        <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
          <FaUsers className="text-white" />
          <span className="text-white text-sm">{participants.length + 1}</span>
        </div>

        {/* Hand Raised Indicator */}
        {handRaised && (
          <div className="absolute bottom-4 left-4 bg-yellow-500 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
            <FaHandPaper className="text-white" />
            <span className="text-white text-sm">Hand Raised</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
        <Button
          variant={isMuted ? 'destructive' : 'secondary'}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
          onClick={toggleMute}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </Button>

        <Button
          variant={isVideoOn ? 'secondary' : 'destructive'}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
          onClick={toggleVideo}
        >
          {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
        </Button>

        {isHost && (
          <Button
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={toggleScreenShare}
          >
            <FaDesktop />
          </Button>
        )}

        <Button
          variant={handRaised ? 'default' : 'secondary'}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
          onClick={handleRaiseHand}
        >
          <FaHandPaper className={handRaised ? 'text-yellow-400' : ''} />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
          onClick={handleLeave}
        >
          <FaPhone className="rotate-[135deg]" />
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/20 text-red-300 text-center text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoCall;
