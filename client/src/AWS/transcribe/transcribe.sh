#!/bin/sh

# Exit on error
echo "main.sh execution starting...."
set -e

# Ensure required environment variables are set
if [ -z "$FILE_KEY" ] || [ -z "$INPUT_BUCKET" ] || [ -z "$OUTPUT_BUCKET" ] || [ -z "$HEIGHT" ] || [ -z "$WIDTH"]; then
  echo "Error: FILE_KEY, INPUT_BUCKET, OUTPUT_BUCKET, HEIGHT, and WIDTH must be set."
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

# Generate HLS master playlist
MASTER_PLAYLIST="${TEMP_DIR}/master.m3u8"
echo "#EXTM3U" > "$MASTER_PLAYLIST"
echo "#EXT-X-VERSION:3" >> "$MASTER_PLAYLIST"

# Determine resolution based on height and width, considering both landscape and portrait orientations
if [[ "$HEIGHT" -ge "$WIDTH" ]]; then
    # Portrait mode (height >= width)
    if [[ "$HEIGHT" -ge 360 ]] && [[ "$WIDTH" -ge 640 ]]; then
        echo "#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=640x360" >> "$MASTER_PLAYLIST"
        echo "360p.m3u8" >> "$MASTER_PLAYLIST"
    fi
    if [[ "$HEIGHT" -ge 480 ]] && [[ "$WIDTH" -ge 854 ]]; then
        echo "#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=854x480" >> "$MASTER_PLAYLIST"
        echo "480p.m3u8" >> "$MASTER_PLAYLIST"
    fi
    if [[ "$HEIGHT" -ge 720 ]] && [[ "$WIDTH" -ge 1280 ]]; then
        echo "#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720" >> "$MASTER_PLAYLIST"
        echo "720p.m3u8" >> "$MASTER_PLAYLIST"
    fi
    if [[ "$HEIGHT" -ge 1080 ]] && [[ "$WIDTH" -ge 1920 ]]; then
        echo "#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080" >> "$MASTER_PLAYLIST"
        echo "1080p.m3u8" >> "$MASTER_PLAYLIST"
    fi
else
    # Landscape mode (width > height)
    if [[ "$WIDTH" -ge 360 ]] && [[ "$HEIGHT" -ge 640 ]]; then
        echo "#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=360x640" >> "$MASTER_PLAYLIST"
        echo "360p.m3u8" >> "$MASTER_PLAYLIST"
    fi
    if [[ "$WIDTH" -ge 480 ]] && [[ "$HEIGHT" -ge 854 ]]; then
        echo "#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=480x854" >> "$MASTER_PLAYLIST"
        echo "480p.m3u8" >> "$MASTER_PLAYLIST"
    fi
    if [[ "$WIDTH" -ge 720 ]] && [[ "$HEIGHT" -ge 1280 ]]; then
        echo "#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=720x1280" >> "$MASTER_PLAYLIST"
        echo "720p.m3u8" >> "$MASTER_PLAYLIST"
    fi
    if [[ "$WIDTH" -ge 1080 ]] && [[ "$HEIGHT" -ge 1920 ]]; then
        echo "#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1080x1920" >> "$MASTER_PLAYLIST"
        echo "1080p.m3u8" >> "$MASTER_PLAYLIST"
    fi
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
