FROM alpine:latest

# Install dependencies and AWS CLI
RUN apk update && \
    apk add --no-cache ffmpeg aws-cli

# Set the working directory
WORKDIR /home/app

# Copy the main.sh script to the container
COPY main.sh main.sh

# Make the script executable
RUN chmod +x main.sh

# Set the default command to execute the script
CMD ["sh", "./main.sh"]



