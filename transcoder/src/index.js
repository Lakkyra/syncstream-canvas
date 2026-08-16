const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

// Initialize Firebase Admin (assuming default credentials in Cloud Run)
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(express.json());

app.post('/transcode', async (req, res) => {
  // Acknowledge the Eventarc trigger immediately to prevent retries
  res.status(202).send('Accepted');

  try {
    // Cloud Storage Object payload format from Eventarc
    const fileEvent = req.body;
    const bucketName = fileEvent.bucket;
    const filePath = fileEvent.name;

    if (!bucketName || !filePath) {
      console.log('Invalid payload');
      return;
    }

    // Only process original uploads (prevent infinite loops with HLS output)
    if (!filePath.includes('/uploads/')) {
      console.log('Not an original upload, skipping.');
      return;
    }

    console.log(`Starting transcode for ${filePath}`);

    const bucket = admin.storage().bucket(bucketName);
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    const outputDir = path.join(os.tmpdir(), 'output');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // 1. Download file from Cloud Storage
    await bucket.file(filePath).download({ destination: tempFilePath });

    const m3u8Path = path.join(outputDir, 'playlist.m3u8');

    // 2. Transcode to HLS
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .outputOptions([
          '-preset veryfast',
          '-g 48',
          '-sc_threshold 0',
          '-map 0:v:0',
          '-map 0:a:0',
          '-c:v libx264',
          '-c:a aac',
          '-b:v 2000k',
          '-maxrate 2140k',
          '-bufsize 4000k',
          '-hls_time 4',
          '-hls_playlist_type vod',
          `-hls_segment_filename ${path.join(outputDir, 'segment_%03d.ts')}`
        ])
        .output(m3u8Path)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    console.log(`Transcoding finished for ${filePath}`);

    // 3. Upload HLS segments back to Cloud Storage
    const files = fs.readdirSync(outputDir);
    const baseStorageDir = filePath.replace('/uploads/', '/hls/').replace(path.basename(filePath), '');
    
    for (const file of files) {
      const localFilePath = path.join(outputDir, file);
      const destination = path.join(baseStorageDir, file);
      
      await bucket.upload(localFilePath, { destination });
      fs.unlinkSync(localFilePath);
    }

    fs.unlinkSync(tempFilePath);

    // 4. Update Firestore document status to "ready"
    // Extract mediaId from path (e.g. users/uid/uploads/mediaId/file.mp4)
    const pathParts = filePath.split('/');
    const userId = pathParts[1];
    const mediaId = pathParts[3];

    await admin.firestore()
      .collection('users').doc(userId)
      .collection('media').doc(mediaId)
      .update({
        status: 'ready',
        hlsUrl: `gs://${bucketName}/${baseStorageDir}playlist.m3u8`
      });

    console.log(`Successfully completed HLS pipeline for ${mediaId}`);

  } catch (error) {
    console.error('Transcoder Error:', error);
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Transcoder service listening on port ${port}`);
});
