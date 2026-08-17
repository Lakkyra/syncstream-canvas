"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export function VideoPlayer({ src, onFullscreenChange }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [levels, setLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 is auto
  
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentAudio, setCurrentAudio] = useState<number>(0);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setLevels(hls.levels);
        setAudioTracks(hls.audioTracks);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
        setCurrentAudio(data.id);
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = src;
    }
  }, [src]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      if (onFullscreenChange) onFullscreenChange(isFs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [onFullscreenChange]);

  const handleLevelChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex; // -1 for auto
      setCurrentLevel(levelIndex);
    }
  };

  const handleAudioChange = (trackId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudio(trackId);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group">
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
      />
      
      {/* Settings Gear Overlay */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        {showSettings && (
          <div className="absolute right-0 mt-2 w-48 bg-surface-container/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 text-sm text-white">
            
            {/* Resolution Selector */}
            {levels.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-white/50 mb-1 px-2 uppercase tracking-wider">Quality</div>
                <button 
                  onClick={() => handleLevelChange(-1)}
                  className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/10 ${currentLevel === -1 ? 'text-primary' : ''}`}
                >
                  Auto
                </button>
                {levels.map((level, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleLevelChange(idx)}
                    className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/10 ${currentLevel === idx ? 'text-primary' : ''}`}
                  >
                    {level.height}p
                  </button>
                ))}
              </div>
            )}

            {/* Audio Selector */}
            {audioTracks.length > 1 && (
              <div>
                <div className="text-xs text-white/50 mb-1 px-2 uppercase tracking-wider">Audio</div>
                {audioTracks.map((track) => (
                  <button 
                    key={track.id}
                    onClick={() => handleAudioChange(track.id)}
                    className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/10 ${currentAudio === track.id ? 'text-primary' : ''}`}
                  >
                    {track.name || `Track ${track.id}`}
                  </button>
                ))}
              </div>
            )}
            
            <button 
              onClick={toggleFullscreen}
              className="mt-2 w-full text-left px-2 py-1.5 rounded hover:bg-white/10 flex items-center justify-between border-t border-white/10 pt-2"
            >
              Fullscreen
              <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
