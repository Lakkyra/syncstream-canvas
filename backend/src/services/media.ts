import { supabase } from "../supabase";

export async function createMediaRecord(
  userId: string, 
  mediaId: string, 
  filename: string, 
  contentType: string, 
  sizeBytes: number,
  storagePath: string
) {
  const { error } = await supabase
    .from('media')
    .insert({
      id: mediaId,
      user_id: userId,
      filename,
      content_type: contentType,
      size_bytes: sizeBytes,
      storage_path: storagePath,
      status: "uploading",
      created_at: new Date().toISOString()
    });

  if (error) {
    throw new Error("Failed to create media record: " + error.message);
  }
}

export async function markMediaProcessing(userId: string, mediaId: string) {
  const { error } = await supabase
    .from('media')
    .update({ status: "processing" })
    .match({ id: mediaId, user_id: userId });

  if (error) {
    throw new Error("Failed to update media status: " + error.message);
  }
}
