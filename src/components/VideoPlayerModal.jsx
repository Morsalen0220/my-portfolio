import React from 'react';
import VideoEmbed from './VideoEmbed';

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const VideoPlayerModal = ({ item, onClose }) => {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="max-w-4xl w-full bg-gray-800 rounded-lg overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Closes modal only on overlay click
            >
                <div className="aspect-video bg-black">
                   {/* CHANGE: Pass item.videoUrl as url and set isModal=true */}
                   <VideoEmbed url={item.videoUrl} isModal={true} />
                </div>
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-2xl font-bold mb-2 text-white">{item.title}</h4>
                            <p className="text-gray-400">{item.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <XIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerModal;