const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

async function probeFile(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
}

function generateMasterPlaylist(outputDir, variants, audios) {
  let master = "#EXTM3U\n#EXT-X-VERSION:3\n";

  // Add Audio Groups
  audios.forEach((audio, i) => {
    const lang = audio.tags && audio.tags.language ? audio.tags.language : `lang_${i}`;
    const name = audio.tags && audio.tags.title ? audio.tags.title : `Audio ${i + 1}`;
    const defaultFlag = i === 0 ? "YES" : "NO";
    master += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="${lang}",NAME="${name}",AUTOSELECT=${defaultFlag},DEFAULT=${defaultFlag},URI="audio_${i}/playlist.m3u8"\n`;
  });

  // Add Video Variants
  variants.forEach((variant) => {
    const bandwidth = variant.height === 1080 ? 4000000 : variant.height === 720 ? 2500000 : 1000000;
    master += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${variant.width}x${variant.height},AUDIO="audio"\n`;
    master += `${variant.height}p/playlist.m3u8\n`;
  });

  fs.writeFileSync(path.join(outputDir, 'master.m3u8'), master);
}

async function processMedia(tempFilePath, outputDir) {
  const metadata = await probeFile(tempFilePath);
  
  const videoStreams = metadata.streams.filter(s => s.codec_type === 'video');
  const audioStreams = metadata.streams.filter(s => s.codec_type === 'audio');
  
  if (videoStreams.length === 0) throw new Error("No video stream found");
  
  const video = videoStreams[0];
  const sourceHeight = video.height;

  // Determine variants based on source height
  const variants = [];
  if (sourceHeight >= 1080) variants.push({ height: 1080, width: 1920, bitrate: '4000k' });
  if (sourceHeight >= 720) variants.push({ height: 720, width: 1280, bitrate: '2500k' });
  if (sourceHeight >= 480 || variants.length === 0) variants.push({ height: 480, width: 854, bitrate: '1000k' });

  // 1. Generate Video Variants
  for (const variant of variants) {
    const variantDir = path.join(outputDir, `${variant.height}p`);
    if (!fs.existsSync(variantDir)) fs.mkdirSync(variantDir, { recursive: true });

    console.log(`Processing video variant: ${variant.height}p`);
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .outputOptions([
          '-preset veryfast',
          '-g 48',
          '-sc_threshold 0',
          '-map 0:v:0',
          `-vf scale=-2:${variant.height}`,
          '-c:v libx264',
          `-b:v ${variant.bitrate}`,
          `-maxrate ${variant.bitrate}`,
          `-bufsize ${parseInt(variant.bitrate) * 2}k`,
          '-an', // No audio in video segments
          '-hls_time 4',
          '-hls_playlist_type vod',
          `-hls_segment_filename ${path.join(variantDir, 'segment_%03d.ts')}`
        ])
        .output(path.join(variantDir, 'playlist.m3u8'))
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  // 2. Generate Audio Variants
  // If no audio streams, we still need to create a dummy silent one, but assume there is at least one.
  for (let i = 0; i < audioStreams.length; i++) {
    const audioDir = path.join(outputDir, `audio_${i}`);
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

    console.log(`Processing audio stream: ${i}`);
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .outputOptions([
          `-map 0:a:${i}`,
          '-c:a aac',
          '-b:a 128k',
          '-vn', // No video
          '-hls_time 4',
          '-hls_playlist_type vod',
          `-hls_segment_filename ${path.join(audioDir, 'segment_%03d.ts')}`
        ])
        .output(path.join(audioDir, 'playlist.m3u8'))
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  // 3. Generate Master Playlist
  generateMasterPlaylist(outputDir, variants, audioStreams);
  
  return { variants, audioStreams };
}

module.exports = { processMedia };
