const AWS = require('aws-sdk');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const s3 = new AWS.S3();
const execPromise = util.promisify(exec);

module.exports.handler = async (event) => {
    try {
        const eventBody = JSON.parse(event.Records[0].body);
        const INPUT_KEY = eventBody.Records[0].s3.object.key;
        const INPUT_BUCKET = eventBody.Records[0].s3.bucket.name;
        const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;
        const BASE_NAME = path.parse(INPUT_KEY).name;
        const TEMP_DIR = `/tmp/${BASE_NAME}`;
        const inputPath = `/tmp/${path.basename(INPUT_KEY)}`;
        const audioOutputPath = `/tmp/${BASE_NAME}.mp3`;

        // Extract width & height from filename
        const filenameParts = BASE_NAME.split('_');
        const WIDTH = parseInt(filenameParts[filenameParts.length - 2], 10);
        const HEIGHT = parseInt(filenameParts[filenameParts.length - 1], 10);

        if (isNaN(WIDTH) || isNaN(HEIGHT)) {
            throw new Error("Invalid filename format. Expected format: <UUID>_<title>_<width>_<height>.mp4");
        }

        console.log(`Detected Width: ${WIDTH}, Height: ${HEIGHT}`);

        // Ensure TEMP_DIR exists
        fs.mkdirSync(TEMP_DIR, { recursive: true });

        console.log(`Downloading from S3: ${INPUT_BUCKET}/${INPUT_KEY}`);

        // Download file from S3
        const file = await s3.getObject({ Bucket: INPUT_BUCKET, Key: INPUT_KEY }).promise();
        fs.writeFileSync(inputPath, file.Body);

        // Generate Thumbnails & VTT
        await generateThumbnailsAndVTT(inputPath, TEMP_DIR, BASE_NAME, OUTPUT_BUCKET);

        // Extract Audio
        await extractAudio(inputPath, audioOutputPath, BASE_NAME, OUTPUT_BUCKET);

        // Generate HLS Master Playlist
        await generateHLSMasterPlaylist(BASE_NAME, TEMP_DIR, OUTPUT_BUCKET, WIDTH, HEIGHT);

        console.log("Processing complete.");
        return { status: "SUCCESS" };
    } catch (err) {
        console.error("ERROR:", err);
        throw err;
    }
};

// Generate Thumbnails & VTT
const generateThumbnailsAndVTT = async (inputPath, tempDir, baseName, outputBucket) => {
    console.log("Generating thumbnails and VTT...");

    const VTT_FILE = path.join(tempDir, 'thumbnails.vtt');
    fs.writeFileSync(VTT_FILE, "WEBVTT\n\n");

    // Generate thumbnails at 1 frame per second
    await execPromise(`ffmpeg -i ${inputPath} -vf "fps=1,scale=320:-1" -q:v 2 ${tempDir}/thumb_%03d.jpg`);

    console.log("Uploading thumbnails and VTT to S3...");

    const thumbnailFiles = fs.readdirSync(tempDir).filter(file => file.startsWith('thumb_') && file.endsWith('.jpg'));

    thumbnailFiles.forEach((file, index) => {
        const timestamp = formatTimestamp(index);
        fs.appendFileSync(VTT_FILE, `${timestamp} --> ${formatTimestamp(index + 1)}\n${file}\n\n`);
    });

    // Upload thumbnails to S3
    for (const file of thumbnailFiles) {
        await s3.putObject({
            Bucket: outputBucket,
            Key: `${baseName}/thumbnails/${file}`,
            Body: fs.readFileSync(path.join(tempDir, file)),
            ContentType: "image/jpeg",
        }).promise();
    }

    // Upload VTT file
    await s3.putObject({
        Bucket: outputBucket,
        Key: `${baseName}/thumbnails/thumbnails.vtt`,
        Body: fs.readFileSync(VTT_FILE),
        ContentType: "text/vtt",
    }).promise();

    console.log(`Uploaded thumbnails and VTT to s3://${outputBucket}/${baseName}/thumbnails/`);
};

// Extract Audio
const extractAudio = async (inputPath, outputPath, baseName, outputBucket) => {
    console.log("Extracting audio...");

    await execPromise(`ffmpeg -i ${inputPath} -vn -acodec libmp3lame ${outputPath}`);

    await s3.putObject({
        Bucket: outputBucket,
        Key: `${baseName}/audio.mp3`,
        Body: fs.readFileSync(outputPath),
        ContentType: "audio/mpeg",
    }).promise();

    console.log("Audio uploaded to S3.");
};

// Generate HLS Master Playlist
const generateHLSMasterPlaylist = async (baseName, tempDir, outputBucket, width, height) => {
    console.log("Generating HLS master playlist...");

    const masterPlaylistPath = path.join(tempDir, 'master.m3u8');
    let masterPlaylistContent = "#EXTM3U\n#EXT-X-VERSION:3\n";

    const resolutions = [
        { width: 640, height: 360, bitrate: 500000, filename: "360p.m3u8" },
        { width: 854, height: 480, bitrate: 1000000, filename: "480p.m3u8" },
        { width: 1280, height: 720, bitrate: 2500000, filename: "720p.m3u8" },
        { width: 1920, height: 1080, bitrate: 5000000, filename: "1080p.m3u8" },
    ];

    for (const res of resolutions) {
        if (width >= res.width && height >= res.height) {
            masterPlaylistContent += `#EXT-X-STREAM-INF:BANDWIDTH=${res.bitrate},RESOLUTION=${res.width}x${res.height}\n${res.filename}\n`;
        }
    }

    fs.writeFileSync(masterPlaylistPath, masterPlaylistContent);

    await s3.putObject({
        Bucket: outputBucket,
        Key: `${baseName}/master.m3u8`,
        Body: fs.readFileSync(masterPlaylistPath),
        ContentType: "application/x-mpegURL",
    }).promise();

    console.log(`Uploaded master.m3u8 to s3://${outputBucket}/${baseName}/hls/master.m3u8`);
};

// Format timestamps for VTT (e.g., "00:00:01.000")
const formatTimestamp = (index) => {
    const seconds = index;
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}.000`;
};
