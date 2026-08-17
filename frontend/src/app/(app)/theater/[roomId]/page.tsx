"use client";

import { use } from "react";
import { useState } from "react";
import { VideoPlayer } from "@/components/theater/VideoPlayer";
import { WatchPartyChat } from "@/components/theater/WatchPartyChat";

export default function TheaterPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In production, fetch the media document from Supabase using the roomId
  // For demo purposes, we will load a sample HLS stream or assume the url matches the roomId
  const demoHlsUrl = `https://storage.googleapis.com/syncstream-canvas-dev.appspot.com/users/dummy/hls/${roomId}/master.m3u8`;

  const handleEndParty = async () => {
    if (!confirm("Are you sure you want to end the watch party? This will instantly delete the video from decentralized Storj!")) return;
    try {
      await fetch("/api/room/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: roomId }), // In this demo, roomId === mediaId
      });
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Failed to end party");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-black overflow-hidden relative pt-16">
      {/* Top Bar for Host Controls */}
      {!isFullscreen && (
        <div className="absolute top-20 left-8 z-50">
          <button 
            onClick={handleEndParty}
            className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg font-mono text-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            End Watch Party (Delete Media)
          </button>
        </div>
      )}
      {/* Main Video Area */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 ${isFullscreen ? 'w-full p-0' : 'mr-80'}`}>
        <div className={`w-full aspect-video bg-surface shadow-2xl relative overflow-hidden flex items-center justify-center ${isFullscreen ? 'max-w-none rounded-none' : 'max-w-[1200px] rounded-xl ring-1 ring-white/10'}`}>
          <VideoPlayer 
            src={demoHlsUrl} 
            onFullscreenChange={setIsFullscreen} 
          />
        </div>
      </div>

      <WatchPartyChat 
        roomId={roomId} 
        isFullscreen={isFullscreen} 
      />
    </div>
  );
}
