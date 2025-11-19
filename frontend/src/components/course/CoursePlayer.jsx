import React, { useState, useRef } from 'react';
import { FaPlay, FaVolumeUp, FaExpand } from 'react-icons/fa';
import { formatDuration } from '../../utils/helpers';
import Card from '../common/Card';

const CoursePlayer = ({ lecture, onProgressUpdate }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      const progress = Math.floor((current / duration) * 100);
      if (onProgressUpdate) onProgressUpdate(progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="relative bg-black rounded-lg overflow-hidden group">
          <video
            ref={videoRef}
            src={lecture?.videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-auto"
            onClick={handlePlayPause}
          />
          {!isPlaying && (
            <button onClick={handlePlayPause} className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <FaPlay className="text-white text-6xl" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="mb-3">
              <div className="bg-gray-700 rounded-full h-1 cursor-pointer">
                <div className="bg-red-600 h-1 rounded-full transition-all" style={{ width: `${(currentTime / duration) * 100}%` }} />
              </div>
              <div className="flex justify-between text-white text-xs mt-1">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-white">
              <button onClick={handlePlayPause} className="hover:text-red-500 transition"><FaPlay className="text-lg" /></button>
              <div className="flex items-center gap-3">
                <button className="hover:text-red-500 transition"><FaVolumeUp className="text-lg" /></button>
                <button className="hover:text-red-500 transition"><FaExpand className="text-lg" /></button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{lecture?.title}</h2>
          <p className="text-gray-600">{lecture?.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Duration: {formatDuration(duration)}</span>
            <span>Watched: {Math.floor((currentTime / duration) * 100)}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CoursePlayer;
