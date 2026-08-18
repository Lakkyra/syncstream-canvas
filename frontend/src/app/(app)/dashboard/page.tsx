"use client";

import { useState, useEffect } from "react";
import { StorageMeter } from "@/components/dashboard/StorageMeter";
import { UploadDropzone } from "@/components/dashboard/UploadDropzone";
import { MediaGrid, type MediaItem } from "@/components/dashboard/MediaGrid";
import { useUpload } from "@/hooks/useUpload";

export default function DashboardPage() {
  const { uploadFile, isUploading, progress } = useUpload();
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const usedBytes = mediaItems.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const maxBytes = 10 * 1024 * 1024 * 1024; // 10GB

  const fetchMedia = async () => {
    try {
      // Call the Next.js API route which securely adds the Google OAuth user ID
      // (Using /api/user-uploads instead of /api/media to avoid ad-blocker false positives)
      const res = await fetch("/api/user-uploads");
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch media", err);
    }
  };

  useEffect(() => {
    fetchMedia();
    
    // Poll every 5 seconds to catch processing -> ready transitions
    const interval = setInterval(fetchMedia, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (file: File) => {
    try {
      const newItem = await uploadFile(file);
      setMediaItems((prev) => [newItem, ...prev]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Check console.");
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-geist text-headline-lg font-bold text-primary">Upload Dashboard</h1>
        <button 
          onClick={fetchMedia}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg font-mono text-sm hover:bg-white/10 transition-colors"
        >
          Refresh List
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Actions & Stats */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <div className="h-48">
            <StorageMeter usedBytes={usedBytes} maxBytes={maxBytes} />
          </div>
          <div className="h-64">
            <UploadDropzone 
              onUpload={handleUpload} 
              isUploading={isUploading} 
              progress={progress} 
            />
          </div>
        </div>

        {/* Right Column: Media List */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          <div className="glass-panel p-6 rounded-xl min-h-[calc(48px+12rem+1.5rem)]">
            <h2 className="font-geist text-headline-md mb-6">Your Media</h2>
            <MediaGrid items={mediaItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
