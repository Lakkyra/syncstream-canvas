import { storage } from "../firebase";
import { randomUUID } from "crypto";

export async function generateUploadUrl(userId: string, filename: string, contentType: string, sizeBytes: number) {
  if (sizeBytes > 2 * 1024 * 1024 * 1024) {
    throw new Error("File too large");
  }

  const mediaId = randomUUID();
  const storagePath = `users/${userId}/uploads/${mediaId}/${filename}`;

  const bucket = storage.bucket();
  const file = bucket.file(storagePath);
  
  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  return { uploadUrl, mediaId, storagePath };
}
