#!/bin/sh

# Exit on error
echo "main.sh execution starting...."
set -e

# Ensure required environment variables are set
if [ -z "$FILE_KEY" ] || [ -z "$INPUT_BUCKET" ] || [ -z "$OUTPUT_BUCKET" ] || [ -z "$MAX_RES" ]; then
  echo "Error: FILE_KEY, INPUT_BUCKET, and OUTPUT_BUCKET must be set."
  exit 1
fi

# Define base name from the FILE_KEY
BASE_NAME=$(basename "$FILE_KEY" .mp4)
MAX_RES_INT=$((MAX_RES))
# Define input and output paths
INPUT_FILE="https://s3.ap-south-1.amazonaws.com/${INPUT_BUCKET}/${FILE_KEY}"
OUTPUT_PATH="s3://${OUTPUT_BUCKET}/${BASE_NAME}"

# Create a temporary directory for intermediate files
TEMP_DIR=$(mktemp -d)
if [ ! -d "$TEMP_DIR" ]; then
  echo "Error: Failed to create temporary directory."
  exit 1
fi

# Generate HLS master playlist
MASTER_PLAYLIST="${TEMP_DIR}/master.m3u8"
echo "#EXTM3U" > "$MASTER_PLAYLIST"
echo "#EXT-X-VERSION:3" >> "$MASTER_PLAYLIST"
# Check MAX_RES value and append only relevant resolutions
if [[ "$MAX_RES_INT" -ge 360 ]]; then
    echo "#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=640:360" >> "$MASTER_PLAYLIST"
    echo "360p.m3u8" >> "$MASTER_PLAYLIST"
fi
if [[ "$MAX_RES_INT" -ge 480 ]]; then
    echo "#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=854:480" >> "$MASTER_PLAYLIST"
    echo "480p.m3u8" >> "$MASTER_PLAYLIST"
fi
if [[ "$MAX_RES_INT" -ge 720 ]]; then
    echo "#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280:720" >> "$MASTER_PLAYLIST"
    echo "720p.m3u8" >> "$MASTER_PLAYLIST"
fi
if [[ "$MAX_RES_INT" -ge 1080 ]]; then
    echo "#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920:1080" >> "$MASTER_PLAYLIST"
    echo "1080p.m3u8" >> "$MASTER_PLAYLIST"
fi


# Upload the master playlist to S3
aws s3 cp "$MASTER_PLAYLIST" "${OUTPUT_PATH}/master.m3u8" || { echo "Error uploading master.m3u8"; exit 1; }

# Check if the subtitle file already exists in S3
SUBTITLE_FILE="${OUTPUT_PATH}/subtitle.vtt"
if aws s3 ls "$SUBTITLE_FILE" >/dev/null 2>&1; then
  echo "Subtitle file already exists in S3. Skipping transcription."
else
  # Convert video into mp3
  echo "Extracting audio from video for transcription..."
  ffmpeg -i "$INPUT_FILE" -vn -acodec mp3 "${TEMP_DIR}/subtitle.mp3"

  # Transcribe the audio to generate subtitles using Whisper
  echo "Transcribing audio to generate subtitles..."
  whisper "${TEMP_DIR}/subtitle.mp3" --language en --task transcribe --output_format vtt --model base --output_dir "${TEMP_DIR}"
  # Copy the generated subtitles to S3
  aws s3 cp "${TEMP_DIR}/subtitle.vtt" "$SUBTITLE_FILE" || { echo "Error uploading subtitle.vtt"; exit 1; }
fi

# Clean up temporary directory
rm -rf "$TEMP_DIR"

echo "transcribe.sh execution completed successfully."
