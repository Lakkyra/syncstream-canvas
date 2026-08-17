import { useState } from "react";
import type { MediaItem } from "@/components/dashboard/MediaGrid";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<MediaItem> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Init upload: get signed URL
      const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });

      if (!initRes.ok) throw new Error("Failed to initialize upload");
      
      const { uploadUrl, mediaId } = await initRes.json();

      // 2. Upload to Cloud Storage using XMLHttpRequest for progress events
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        // S3 signed URLs don't need auth headers, the signature is in the query params
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            console.error("Supabase Upload Error:", xhr.status, xhr.responseText);
            reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => reject(new Error("XHR Network Error"));
        xhr.send(file);
      });

      // 3. Complete upload
      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });

      if (!completeRes.ok) throw new Error("Failed to complete upload");

      return {
        id: mediaId,
        filename: file.name,
        sizeBytes: file.size,
        status: "processing",
        createdAt: Date.now(),
      };
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return { uploadFile, isUploading, progress };
}
