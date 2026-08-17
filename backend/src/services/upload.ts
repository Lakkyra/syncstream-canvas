import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Lazy-init: the S3 client must NOT be created at import time because
// dotenv.config() hasn't run yet (ES imports are hoisted above all statements).
let _s3Client: S3Client | null = null;
function getS3Client(): S3Client {
  if (!_s3Client) {
    console.log("[upload] Initializing S3 client with key:", process.env.STORJ_ACCESS_KEY ? "(set)" : "(MISSING!)");
    _s3Client = new S3Client({
      endpoint: process.env.STORJ_ENDPOINT || "https://gateway.storjshare.io",
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.STORJ_ACCESS_KEY || "",
        secretAccessKey: process.env.STORJ_SECRET_KEY || "",
      },
      forcePathStyle: true,
    });
  }
  return _s3Client;
}

function getBucketName(): string {
  return process.env.STORJ_BUCKET_NAME || "media";
}

export async function generateUploadUrl(userId: string, filename: string, contentType: string, sizeBytes: number) {
  // Allow up to 25GB (Storj free tier limit)
  if (sizeBytes > 25 * 1024 * 1024 * 1024) {
    throw new Error("File too large");
  }

  const mediaId = randomUUID();
  const storagePath = `users/${userId}/uploads/${mediaId}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: storagePath,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 3600 });

  // No token is needed because S3 signed URLs include the auth signature in the URL parameters
  return { uploadUrl, mediaId, storagePath };
}

export async function deleteMediaPrefix(prefix: string) {
  try {
    const listCmd = new ListObjectsV2Command({
      Bucket: getBucketName(),
      Prefix: prefix
    });
    const listRes = await getS3Client().send(listCmd);
    
    if (listRes.Contents && listRes.Contents.length > 0) {
      for (const item of listRes.Contents) {
        if (item.Key) {
          const delCmd = new DeleteObjectCommand({
            Bucket: getBucketName(),
            Key: item.Key
          });
          await getS3Client().send(delCmd);
        }
      }
    }
  } catch (err) {
    console.error("Error deleting prefix from Storj:", err);
  }
}
