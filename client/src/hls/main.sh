#!/bin/bash

# Environment variables
BASE_NAME=$(basename $FILE_KEY)
# Define input path
INPUT_FILE="https://s3.ap-south-1.amazonaws.com/${INPUT_BUCKET}/__outputs/disgusting-busy-church/${FILE_KEY}"

# Define output paths
OUTPUT_PATH="https://s3.ap-south-1.amazonaws.com/${OUTPUT_BUCKET}/${BASE_NAME}/"

TEMP_DIR=$(mktemp -d)
if [[ ! -d "$TEMP_DIR" ]]; then
  echo "Error: Failed to create temporary directory."
  exit 1
fi

# Process the video and generate all resolutions and playlists with ffmpeg
echo "Processing video and generating HLS playlists..."
ffmpeg -i "$INPUT_FILE" \
  -vf scale=640:360 -b:v 500k -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${TEMP_DIR}/360p_%03d.ts" "${TEMP_DIR}/360p.m3u8" \
  -vf scale=854:480 -b:v 1000k -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${TEMP_DIR}/480p_%03d.ts" "${TEMP_DIR}/480p.m3u8" \
  -vf scale=1280:720 -b:v 2500k -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${TEMP_DIR}/720p_%03d.ts" "${TEMP_DIR}/720p.m3u8" \
  -vf scale=1920:1080 -b:v 5000k -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${TEMP_DIR}/1080p_%03d.ts" "${TEMP_DIR}/1080p.m3u8" \
  -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${TEMP_DIR}/master_%03d.ts" "${TEMP_DIR}/master.m3u8"

# Upload processed files to S3
echo "Uploading files to S3..."
aws s3 cp "${TEMP_DIR}/360p.m3u8" "${OUTPUT_PATH}360p.m3u8" || { echo "Error uploading 360p playlist"; exit 1; }
aws s3 cp "${TEMP_DIR}/480p.m3u8" "${OUTPUT_PATH}480p.m3u8" || { echo "Error uploading 480p playlist"; exit 1; }
aws s3 cp "${TEMP_DIR}/720p.m3u8" "${OUTPUT_PATH}720p.m3u8" || { echo "Error uploading 720p playlist"; exit 1; }
aws s3 cp "${TEMP_DIR}/1080p.m3u8" "${OUTPUT_PATH}1080p.m3u8" || { echo "Error uploading 1080p playlist"; exit 1; }
aws s3 cp "${TEMP_DIR}/master.m3u8" "${OUTPUT_PATH}master.m3u8" || { echo "Error uploading master playlist"; exit 1; }

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "Processing complete."
