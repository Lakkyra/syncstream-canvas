import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
  endpoint: process.env.STORJ_ENDPOINT || "https://gateway.storjshare.io",
  region: "us-east-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: process.env.STORJ_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

async function test() {
  const command = new PutObjectCommand({
    Bucket: "media",
    Key: "users/118189382022140697634/uploads/9eacbe56-832f-428c-946a-8266b60d7015/Screen Recording 2025-01-20 033408.mp4",
    ContentType: "video/mp4",
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  let urlStr = url;
  // Simulate if the browser or proxy accidentally decodes the URL's query parameters
  urlStr = urlStr.replace(/%2F/g, '/');
  
  console.log("SIGNED URL:\n", urlStr);

  const res = await fetch(urlStr, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4"
    },
    body: "fake video content"
  });
  
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", await res.text());
}
test();
