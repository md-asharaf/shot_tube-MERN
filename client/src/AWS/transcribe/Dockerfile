# Build stage: Use a larger base image to install dependencies
FROM archlinux:latest AS builder

# Update package lists and install necessary packages
RUN pacman -Syu --noconfirm && \
    pacman -S --noconfirm \
        ffmpeg \
        aws-cli \
        python3 \
        base-devel \
        curl \
        gnupg && \
    # Add Chaotic AUR key and repository
    pacman-key --init && \
    pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com && \
    pacman-key --lsign-key 3056513887B78AEB && \
    pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' && \
    echo -e "\n[chaotic-aur]\nSigLevel = Never\nServer = https://cdn-mirror.chaotic.cx/\$repo/\$arch" >> /etc/pacman.conf && \
    pacman -Sy && \
    pacman -S --noconfirm whisper && \
    # Clean up package cache and remove unnecessary files
    pacman -Scc --noconfirm && \
    rm -rf /var/cache/pacman/pkg/* /tmp/* /var/tmp/*

# Stage 2: Use a smaller image to copy over necessary binaries and files
FROM archlinux:latest

# Copy only the necessary binaries from the builder image
COPY --from=builder /usr/bin/ffmpeg /usr/bin/aws /usr/bin/python3 /usr/bin/whisper /bin/sh /home/app/

# Set working directory
WORKDIR /home/app

# Copy the transcribe.sh script into the container
COPY transcribe.sh /home/app/

# Make the script executable
RUN chmod +x transcribe.sh

# Set the default command
CMD ["sh", "transcribe.sh"]
