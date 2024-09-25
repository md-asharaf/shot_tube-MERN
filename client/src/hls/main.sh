#!/bin/sh

# Exit on error
echo "main.sh execution starting...."
set -e

# Ensure required environment variables are set
if [ -z "$FILE_KEY" ] || [ -z "$INPUT_BUCKET" ] || [ -z "$OUTPUT_BUCKET" ]; then
  echo "Error: FILE_KEY, INPUT_BUCKET, and OUTPUT_BUCKET must be set."
  exit 1
fi

# Define base name from the FILE_KEY
BASE_NAME=$(basename "$FILE_KEY" .mp4)

# Define input and output paths
INPUT_FILE="https://s3.ap-south-1.amazonaws.com/${INPUT_BUCKET}/${FILE_KEY}"
OUTPUT_PATH="s3://${OUTPUT_BUCKET}/${BASE_NAME}"

# Create a temporary directory for intermediate files
TEMP_DIR=$(mktemp -d)
if [ ! -d "$TEMP_DIR" ]; then
  echo "Error: Failed to create temporary directory."
  exit 1
fi

# Initialize the master playlist
MASTER_PLAYLIST="${TEMP_DIR}/master.m3u8"
echo "#EXTM3U" > "$MASTER_PLAYLIST"
echo "#EXT-X-VERSION:3" >> "$MASTER_PLAYLIST"

# Function to process each resolution
process_resolution() {
  RESOLUTION=$1
  BANDWIDTH=$2
  SCALE=$3
  PLAYLIST_NAME="${RESOLUTION}p.m3u8"
  
  echo "Processing $RESOLUTION..."

  # Generate HLS playlist and segments for the resolution
  ffmpeg -i "$INPUT_FILE" -vf "scale=$SCALE" -b:v "$BANDWIDTH"k -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${TEMP_DIR}/${RESOLUTION}p_%03d.ts" "${TEMP_DIR}/${PLAYLIST_NAME}"

  # Upload the generated playlist and segments to S3
  for file in "${TEMP_DIR}/${RESOLUTION}p_"*.ts "${TEMP_DIR}/${PLAYLIST_NAME}"; do
    aws s3 cp "$file" "${OUTPUT_PATH}/$(basename "$file")" || { echo "Error uploading $(basename "$file")"; exit 1; }
  done

  # Append this resolution to the master playlist
  echo "#EXT-X-STREAM-INF:BANDWIDTH=${BANDWIDTH}000,RESOLUTION=${SCALE}" >> "$MASTER_PLAYLIST"
  echo "${PLAYLIST_NAME}" >> "$MASTER_PLAYLIST"
  
  # Upload the updated master playlist to S3
  aws s3 cp "$MASTER_PLAYLIST" "${OUTPUT_PATH}/master.m3u8" || { echo "Error uploading master.m3u8"; exit 1; }
}

# Process each resolution and upload progressively
process_resolution "360" 500 "640:360"
process_resolution "480" 1000 "854:480"
process_resolution "720" 2500 "1280:720"
process_resolution "1080" 5000 "1920:1080"

# Clean up the temporary directory
echo "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "Processing complete."
