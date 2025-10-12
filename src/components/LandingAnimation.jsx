import React, { useState, useEffect } from 'react';

const LandingAnimation = ({ onAnimationComplete }) => {
    const [exitAnimation, setExitAnimation] = useState(false);

    useEffect(() => {
        // Shuru hobar 3.5 second por animation shesh hobe
        const timer = setTimeout(() => {
            setExitAnimation(true);
        }, 3500);

        // Shesh hobar 1 second por main page ashbe
        const completeTimer = setTimeout(() => {
            onAnimationComplete();
        }, 4500);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onAnimationComplete]);

    const name = "[MORSALEN ISLAM]"; // Ekhane apnar naam din

    return (
        <div 
            className={`fixed inset-0 bg-black flex items-center justify-center z-[200] transition-opacity duration-1000 ${exitAnimation ? 'opacity-0' : 'opacity-100'}`}
        >
            <style>
                {`
                .timeline-container {
                    width: 80%;
                    max-width: 400px;
                    position: relative;
                }

                .timeline-bar {
                    width: 100%;
                    height: 2px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                }

                .playhead {
                    position: absolute;
                    top: -20px;
                    left: 0;
                    width: 2px;
                    height: calc(100% + 40px);
                    background-color: #ef4444; /* Red color */
                    box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444;
                    animation: move-playhead 3s ease-in-out forwards;
                }

                @keyframes move-playhead {
                    from { transform: translateX(0%); }
                    to { transform: translateX(200px); } /* half of max-width */
                }
                
                .text-reveal {
                    opacity: 0;
                    transition: opacity 0.5s ease-in;
                }

                .animate-text-reveal {
                    animation: fade-in-text 1s ease-in-out forwards;
                }

                @keyframes fade-in-text {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .timecode {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.4);
                    position: absolute;
                    bottom: 10px;
                }
                `}
            </style>
            
            <div className="timeline-container">
                <div className="text-center mb-4">
                    <h1 
                        className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-white animate-text-reveal"
                        style={{ animationDelay: '0.5s' }}
                    >
                        {name}
                    </h1>
                    <p 
                        className="text-gray-400 text-sm tracking-[0.3em] animate-text-reveal"
                        style={{ animationDelay: '1s' }}
                    >
                        VIDEO EDTOR
                    </p>
                </div>
                
                <div className="relative">
                    <div className="timeline-bar"></div>
                    <div className="playhead"></div>
                    <span className="timecode" style={{ left: '-40px' }}>00:00</span>
                    <span className="timecode" style={{ right: '-40px' }}>00:03</span>
                </div>
            </div>
        </div>
    );
};

export default LandingAnimation;

