import { db } from "../firebase";

export async function createMediaRecord(userId: string, mediaId: string, filename: string, contentType: string, sizeBytes: number, storagePath: string) {
  await db.collection("users").doc(userId).collection("media").doc(mediaId).set({
    id: mediaId,
    filename,
    contentType,
    sizeBytes,
    storagePath,
    status: "pending",
    createdAt: Date.now(),
  });
}

export async function markMediaProcessing(userId: string, mediaId: string) {
  const docRef = db.collection("users").doc(userId).collection("media").doc(mediaId);
  await docRef.update({
    status: "processing",
  });
}
