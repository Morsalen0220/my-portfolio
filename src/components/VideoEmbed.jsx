import React from 'react';

const VideoEmbed = ({ url, isModal = false }) => {
    if (!url) {
        return (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p>No video URL provided.</p>
            </div>
        );
    }

    let embedUrl = '';
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    // Change: Check for Google Drive links
    const isGoogleDrive = url.includes('drive.google.com');

    // Autoplay, mute, and controls parameters (used for YouTube)
    const autoplayParam = isModal ? 'autoplay=1' : 'autoplay=0';
    // NOTE: muteParam is removed as it was causing issues. We use the HTML 'muted' attribute now.
    const controlsParam = isModal ? 'controls=1' : 'controls=0';

    if (isYouTube) {
        // FIX: Regex updated to handle all YouTube formats including Shorts.
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        if (videoId) {
            // YouTube Autoplay/Control logic applied via query parameters
            const youtubeParams = `?${autoplayParam}&controls=${controlsParam}&modestbranding=1&rel=0`; 
            embedUrl = `https://www.youtube.com/embed/${videoId}${youtubeParams}`;
        }
    } else if (isGoogleDrive) {
        // Change: Handle Google Drive links: https://drive.google.com/file/d/FILE_ID/view
        const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
        const fileId = driveMatch ? driveMatch[1] : null;
        if (fileId) {
            // FIX: Removed Autoplay query logic for Google Drive. 
            // It is blocked by CSP anyway, so keeping the URL clean is best practice.
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

    // Set pointer-events-none for cards (isModal=false)
    const pointerEventsClass = isModal ? 'pointer-events-auto' : 'pointer-events-none';
    
    // Use iframe attributes for better control over autoplay/mute
    const iframeAllow = isModal 
        ? "autoplay; fullscreen; picture-in-picture" 
        : "picture-in-picture";
    
    // FIX: Use boolean { true } for muted attribute instead of string 'true'
    const mutedAttribute = isModal ? {} : { muted: true };

    return (
        <iframe
            // Added object-contain for aspect ratio fix
            className={`w-full h-full ${pointerEventsClass} object-contain`}
            src={embedUrl}
            title="Video Player"
            frameBorder="0"
            // Enable autoplay and unmute for modal, but only allow picture-in-picture for card preview
            allow={iframeAllow}
            {...mutedAttribute} // Corrected muted attribute format
            allowFullScreen
        ></iframe>
    );
};

export default VideoEmbed;