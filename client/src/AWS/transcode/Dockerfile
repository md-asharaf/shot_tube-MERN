# Build stage: Use a larger image for building
FROM alpine:latest AS builder

# Install necessary dependencies (ffmpeg and aws-cli)
RUN apk add --no-cache ffmpeg aws-cli

# Copy the transcode.sh script into the build stage
COPY transcode.sh /home/app/

# Stage 2: Minimal final image
FROM alpine:latest

# Copy only the necessary binaries and libraries from the builder
COPY --from=builder /usr/bin/ffmpeg /usr/bin/aws /bin/sh /home/app/

# Copy the transcode.sh script
COPY --from=builder /home/app/transcode.sh /home/app/

# Set the working directory and make the script executable
WORKDIR /home/app
RUN chmod +x transcode.sh

# Run the script by default
CMD ["sh", "transcode.sh"]
