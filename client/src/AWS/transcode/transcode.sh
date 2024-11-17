#!/bin/sh

# Exit on error
echo "main.sh execution starting...."
set -e

# Ensure required environment variables are set
if [ -z "$FILE_KEY" ] || [ -z "$INPUT_BUCKET" ] || [ -z "$OUTPUT_BUCKET" ] || [ -z "$QUALITY" ] || [ -z "$BANDWIDTH" ] || [ -z "$SCALE" ]; then
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

# Function to process each resolution
transcode_and_upload_to_s3() {
  RESOLUTION=$1
  BANDWIDTH=$2
  SCALE=$3
  PLAYLIST_NAME="${RESOLUTION}p.m3u8"

  echo "Checking if $RESOLUTION output already exists in S3..."
  
  # Check if the playlist already exists in the bucket
  if aws s3 ls "${OUTPUT_PATH}/${PLAYLIST_NAME}" >/dev/null 2>&1; then
    echo "$RESOLUTION output already exists in S3. Skipping transcoding."
    return
  fi

  echo "Processing $RESOLUTION..."

  # Generate HLS playlist and segments for the resolution
  ffmpeg -i "$INPUT_FILE" -vf "scale=$SCALE" -b:v "$BANDWIDTH"k -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${TEMP_DIR}/${RESOLUTION}p_%03d.ts" "${TEMP_DIR}/${PLAYLIST_NAME}"

  # Upload the generated playlist and segments to S3
  for file in "${TEMP_DIR}/${RESOLUTION}p_"*.ts "${TEMP_DIR}/${PLAYLIST_NAME}"; do
    aws s3 cp "$file" "${OUTPUT_PATH}/$(basename "$file")" || { echo "Error uploading $(basename "$file")"; exit 1; }
  done
}

# Process the transcoding for each resolution
transcode_and_upload_to_s3 "$QUALITY" "$BANDWIDTH" "$SCALE"

# Clean up the temporary directory
echo "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
echo "main.sh execution completed successfully."
