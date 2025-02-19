FROM alpine:latest

# Install required packages and dependencies for the build
RUN apk update && apk add ffmpeg aws-cli && rm -rf /var/cache/apk/* 

# Set working directory
WORKDIR /home/app

# Copy the transcode.sh script into the container
COPY transcode.sh /home/app/

# Make the script executable
RUN chmod +x /home/app/transcode.sh

# Set the default command
CMD ["sh", "/home/app/transcode.sh"]
