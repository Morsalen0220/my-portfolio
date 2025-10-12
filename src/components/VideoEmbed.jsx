import React from 'react';

const VideoEmbed = ({ item }) => {
    const { videoUrl, type, title } = item || {};

    if (!videoUrl || !videoUrl.includes('https://')) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
                <p className="text-red-400 text-xs p-2">Video URL error.</p>
            </div>
        );
    }

    let embedUrl = '';

    if (type === 'youtube') {
        let videoId = '';
        try {
            if (videoUrl.includes('youtu.be/')) {
                videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            } else if (videoUrl.includes('watch?v=')) {
                videoId = videoUrl.split('watch?v=')[1].split('&')[0];
            }
            if (videoId) {
                // Notun parameter 'modestbranding=1' jog kora hoyeche
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
            }
        } catch (e) {
            console.error("Failed to parse YouTube URL:", e);
        }
    } else if (type === 'drive') {
        if (videoUrl.includes('/preview') || videoUrl.includes('/embed')) {
            embedUrl = videoUrl;
        }
    }

    if (!embedUrl) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
                <p className="text-red-400 text-xs p-2">Could not generate embed link. Check URL format.</p>
            </div>
        );
    }

    return (
        <iframe
            className="w-full h-full"
            src={embedUrl}
            title={title || 'Embedded Video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    );
};

export default VideoEmbed;

