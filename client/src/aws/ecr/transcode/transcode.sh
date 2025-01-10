#!/bin/sh

# Exit on error
echo "main.sh execution starting...."
set -e

# Ensure required environment variables are set
if [ -z "$FILE_KEY" ] || [ -z "$INPUT_BUCKET" ] || [ -z "$OUTPUT_BUCKET" ] || [ -z "$HEIGHT" ] || [ -z "$WIDTH" ] || [ -z "$BANDWIDTH" ]; then
  echo "Error: FILE_KEY, INPUT_BUCKET, OUTPUT_BUCKET, HEIGHT, WIDTH, and BANDWIDTH must be set."
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

# Function to process each resolution using HEIGHT and WIDTH
transcode_and_upload_to_s3() {
  HEIGHT=$1
  WIDTH=$2
  BANDWIDTH=$3
  
  # Choose the smaller dimension (height or width) for the playlist name
  if [ "$HEIGHT" -le "$WIDTH" ]; then
    PLAYLIST_NAME="${HEIGHT}p.m3u8"  # Use height as part of the playlist name
  else
    PLAYLIST_NAME="${WIDTH}p.m3u8"  # Use width as part of the playlist name
  fi

  echo "Checking if $PLAYLIST_NAME output already exists in S3..."
  
  # Check if the playlist already exists in the bucket
  if aws s3 ls "${OUTPUT_PATH}/${PLAYLIST_NAME}" >/dev/null 2>&1; then
    echo "$PLAYLIST_NAME output already exists in S3. Skipping transcoding."
    return
  fi

  echo "Processing video with resolution ${HEIGHT}x${WIDTH}..."

  # Generate HLS playlist and segments for the given height and width
  time ffmpeg -i "$INPUT_FILE" -vf "scale=${WIDTH}:${HEIGHT}" -b:v "${BANDWIDTH}k" -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${TEMP_DIR}/${PLAYLIST_NAME%.*}_%03d.ts" "${TEMP_DIR}/${PLAYLIST_NAME}"

  # Upload the generated playlist and segments to S3
  for file in "${TEMP_DIR}/${PLAYLIST_NAME%.*}"*.ts "${TEMP_DIR}/${PLAYLIST_NAME}"; do
    aws s3 cp "$file" "${OUTPUT_PATH}/$(basename "$file")" || { echo "Error uploading $(basename "$file")"; exit 1; }
  done
}

# Process the transcoding for the given HEIGHT and WIDTH
transcode_and_upload_to_s3 "$HEIGHT" "$WIDTH" "$BANDWIDTH"

# Clean up the temporary directory
echo "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
echo "main.sh execution completed successfully."