# Stage 1: Build the environment with all dependencies
FROM archlinux:latest AS build

# Install required packages and dependencies for the build
RUN pacman -Syu --noconfirm && \
    pacman -S --noconfirm \
        ffmpeg \
        aws-cli \
        python3 \
        base-devel \
        curl \
        gnupg && \
    pacman-key --init && \
    pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com && \
    pacman-key --lsign-key 3056513887B78AEB && \
    pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' && \
    echo -e "\n[chaotic-aur]\nSigLevel = Never\nServer = https://cdn-mirror.chaotic.cx/\$repo/\$arch" >> /etc/pacman.conf && \
    pacman -Sy && \
    pacman -S --noconfirm whisper && \
    pacman -Scc --noconfirm && \
    rm -rf /var/cache/pacman/pkg/* /tmp/* /var/tmp/*

RUN python3 -c "import whisper; whisper.load_model('medium')"
# Set working directory
WORKDIR /home/app

# Copy the transcribe.sh script into the container
COPY transcribe.sh /home/app/

# Make the script executable
RUN chmod +x /home/app/transcribe.sh

# Set the default command
CMD ["sh", "/home/app/transcribe.sh"]