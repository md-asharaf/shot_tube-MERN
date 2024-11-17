FROM archlinux:latest

# Update package lists and install necessary packages in a single RUN command
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

# Download and cache the Whisper model by running a simple Python script to load it
RUN python3 -c "import whisper; whisper.load_model('base')"

# Set the working directory
WORKDIR /home/app

# Copy the main.sh script to the container
COPY transcribe.sh transcribe.sh

# Make the script executable
RUN chmod +x transcribe.sh

# Set the default command to execute the script
CMD ["sh", "transcribe.sh"]
