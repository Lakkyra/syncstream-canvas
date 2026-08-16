"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface UploadDropzoneProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  progress: number;
}

export function UploadDropzone({ onUpload, isUploading, progress }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        onUpload(file);
      } else {
        alert("Only video files are supported.");
      }
    }
  }, [onUpload]);

  return (
    <div 
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "glass-panel p-6 rounded-xl flex flex-col justify-center items-center h-full border-dashed border-2 cursor-pointer transition-all bloom-hover",
        isDragging ? "border-primary bg-primary/10" : "border-white/20",
        isUploading && "pointer-events-none opacity-80"
      )}
    >
      {isUploading ? (
        <div className="flex flex-col items-center w-full px-8">
          <span className="material-symbols-outlined text-4xl mb-4 text-primary animate-pulse">cloud_sync</span>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-sm text-primary">{Math.round(progress)}%</span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-4xl mb-2 text-primary">cloud_upload</span>
          <p className="font-geist font-semibold">Drop video here</p>
          <p className="font-inter text-xs text-on-surface-variant mt-1">MP4, MOV, WEBM (Max 2GB)</p>
        </div>
      )}
    </div>
  );
}
