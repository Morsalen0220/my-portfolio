import React from 'react';

const VideoEmbed = ({ url }) => {
    if (!url) {
        return (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p>No video URL provided.</p>
            </div>
        );
    }

    let embedUrl = '';
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');

    // ব্রাউজারে শব্দসহ অটোপ্লে ব্লক করা থাকে, তাই mute=1 যোগ করা হয়েছে
    if (isYouTube) {
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        if (videoId) {
            // ভিডিওটি ৩ সেকেন্ড থেকে অটোপ্লে করার জন্য প্যারামিটার যোগ করা হয়েছে
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=3&mute=1`;
        }
    } else if (isVimeo) {
        const videoIdMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        if (videoId) {
            // ভিডিওটি ৩ সেকেন্ড থেকে অটোপ্লে করার জন্য প্যারামিটার যোগ করা হয়েছে
            embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1#t=3s`;
        }
    }

    if (!embedUrl) {
        return (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p>Invalid video URL.</p>
            </div>
        );
    }

    return (
        <iframe
            className="w-full h-full"
            src={embedUrl}
            title="Video Player"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
        ></iframe>
    );
};

export default VideoEmbed;