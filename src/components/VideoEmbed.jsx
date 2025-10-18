import React, { useState } from 'react';

const VideoEmbed = ({ url, isModal = false }) => {
    const [isVideoLoaded, setVideoLoaded] = useState(false);

    if (!url) {
        return (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p>No video URL provided.</p>
            </div>
        );
    }

    let embedUrl = '';
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isGoogleDrive = url.includes('drive.google.com');

    const autoplayParam = isModal ? 'autoplay=1' : 'autoplay=0';
    const controlsParam = isModal ? 'controls=1' : 'controls=0';

    if (isYouTube) {
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        if (videoId) {
            const youtubeParams = `?${autoplayParam}&controls=${controlsParam}&modestbranding=1&rel=0`;
            embedUrl = `https://www.youtube.com/embed/${videoId}${youtubeParams}`;
        }
    } else if (isGoogleDrive) {
        const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
        const fileId = driveMatch ? driveMatch[1] : null;
        if (fileId) {
            embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }

    if (!embedUrl) {
        return (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p>Invalid or Unsupported Video URL (Only YouTube/Google Drive supported).</p>
            </div>
        );
    }

    const pointerEventsClass = isModal ? 'pointer-events-auto' : 'pointer-events-none';
    const iframeAllow = isModal
        ? "autoplay; fullscreen; picture-in-picture"
        : "picture-in-picture";
    const mutedAttribute = isModal ? {} : { muted: true };

    const handleVideoLoad = () => {
        setVideoLoaded(true);
    };

    return (
        <iframe
            className={`w-full h-full ${pointerEventsClass} object-contain transition-opacity duration-500 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            src={embedUrl}
            title="Video Player"
            frameBorder="0"
            allow={iframeAllow}
            {...mutedAttribute}
            allowFullScreen
            onLoad={handleVideoLoad}
        ></iframe>
    );
};

export default VideoEmbed;