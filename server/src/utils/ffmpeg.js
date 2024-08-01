import ffmpeg from 'fluent-ffmpeg';
const transcodeVideo = (inputPath, outputPath, resolution) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')
            .size(resolution)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
};
const generateHLSPlaylist = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls',
            ])
            .output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
};

export { transcodeVideo, generateHLSPlaylist };