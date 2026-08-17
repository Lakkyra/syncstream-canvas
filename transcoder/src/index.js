const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const os = require('os');
const WebSocket = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Missing Supabase credentials in transcoder .env! It will fail to connect.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket
  }
});

const app = express();
app.use(express.json());

app.post('/transcode', async (req, res) => {
  // Acknowledge the trigger immediately to prevent retries
  res.status(202).send('Accepted');

  try {
    const fileEvent = req.body;
    const bucketName = fileEvent.bucket || "media";
    const filePath = fileEvent.name;
    const mediaId = fileEvent.mediaId;

    if (!filePath || !mediaId) {
      console.log('Invalid payload');
      return;
    }

    // Only process original uploads (prevent infinite loops with HLS output)
    if (!filePath.includes('/uploads/')) {
      console.log('Not an original upload, skipping.');
      return;
    }

    console.log(`Starting transcode for ${filePath}`);

    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    const outputDir = path.join(os.tmpdir(), 'output');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Initialize S3 client for Storj
    const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
    const { Upload } = require("@aws-sdk/lib-storage");
    const { pipeline } = require("stream/promises");

    const s3Client = new S3Client({
      endpoint: process.env.STORJ_ENDPOINT || "https://gateway.storjshare.io",
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.STORJ_ACCESS_KEY || "",
        secretAccessKey: process.env.STORJ_SECRET_KEY || "",
      },
      forcePathStyle: true,
    });
    const s3BucketName = process.env.STORJ_BUCKET_NAME || "media";

    // 1. Download file from Storj S3
    const getObjCmd = new GetObjectCommand({
      Bucket: s3BucketName,
      Key: filePath
    });
    const { Body } = await s3Client.send(getObjCmd);
    const writeStream = fs.createWriteStream(tempFilePath);
    await pipeline(Body, writeStream);

    // 2. Transcode to HLS using advanced processor
    const { processMedia } = require('./processMedia');
    await processMedia(tempFilePath, outputDir);

    console.log(`Transcoding finished for ${filePath}`);

    // 3. Upload all HLS files back to Storj S3 recursively
    const baseStorageDir = filePath.replace('/uploads/', '/hls/').replace(path.basename(filePath), '');
    
    async function uploadDirectory(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(outputDir, fullPath);
        const destination = path.join(baseStorageDir, relativePath).replace(/\\/g, '/');
        
        if (entry.isDirectory()) {
          await uploadDirectory(fullPath);
        } else {
          const fileStream = fs.createReadStream(fullPath);
          const ext = path.extname(entry.name);
          const contentType = ext === '.m3u8' ? 'application/x-mpegURL' : ext === '.ts' ? 'video/MP2T' : 'application/octet-stream';
          
          const upload = new Upload({
            client: s3Client,
            params: {
              Bucket: s3BucketName,
              Key: destination,
              Body: fileStream,
              ContentType: contentType
            }
          });

          await upload.done();
        }
      }
    }

    await uploadDirectory(outputDir);

    // Clean up local temp files
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.unlinkSync(tempFilePath);

    // 4. Update Supabase Postgres document status to "ready"
    // Assuming Storj gateway is used for public access
    const endpointStr = process.env.STORJ_ENDPOINT || "https://gateway.storjshare.io";
    const hlsUrl = `${endpointStr}/${s3BucketName}/${baseStorageDir}master.m3u8`;
    
    const { error: dbError } = await supabase
      .from('media')
      .update({
        status: 'ready',
        hls_url: hlsUrl
      })
      .match({ id: mediaId });

    if (dbError) throw new Error("DB Update failed: " + dbError.message);

    console.log(`Successfully completed HLS pipeline for ${mediaId}`);

  } catch (error) {
    console.error('Transcoder Error:', error);
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Transcoder service listening on port ${port}`);
});
