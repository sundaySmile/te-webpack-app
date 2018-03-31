export const VIDEO_TYPE = {
    MP4: 'video/mp4',
    HLS: 'application/x-mpegURL'
};

export const AUDIO_TYPE = {
    MP3: 'audio/mp3',
    OGG: 'audio/ogg'
};

export const RENDER_TYPE = {
    MODE_RECTANGLE: 0,
    MODE_RECTANGLE_STEREO:1,
    MODE_OCTAHEDRON: 2,
    MODE_SPHERE: 3,
    MODE_RECTANGLE_STEREO_TD: 4,
    MODE_SPHERE_STEREO_LR: 5,
    MODE_SPHERE_STEREO_TD: 6,
    MODE_HALF_SPHERE_LR: 7,
    MODE_HALF_SPHERE_TD: 8,
    MODE_HALF_SPHERE: 9,
    MODE_CYLINDER_STEREO_TD: 10,
    MODE_CUBE: 11,
    MODE_OCTAHEDRON_STEREO_LR: 2,
    MODE_OCTAHEDRON_STEREO_TD: 13,
    MODE_OCTAHEDRON_HALF: 14,
    MODE_OCTAHEDRON_HALF_STEREO_LR: 15,
    MODE_OCTAHEDRON_HALF_STEREO_TD: 16,
    MODE_HALF_SPHERE_VIP: 17
};

export function getVideoMIMEType(url = '') {
    const ext = url.split('.').pop();
    let type;
    if (ext) {
        type = supportedVideoTypes[ext.toLowerCase()];
    }
    if (type) {
        return type;
    }
    throw new Error(`Video resource is not supported: ${url}`);
}

const supportedVideoTypes = {
    mp4: 'video/mp4',
    m3u: 'application/x-mpegURL',
    m3u8: 'application/x-mpegURL'
};