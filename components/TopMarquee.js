"use client";

import React, { useState } from "react";

const TopMarquee = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 w-full bg-[#0066FF] text-white py-2 overflow-hidden z-[60]">
            <div className="marquee-container relative">
                <div className="marquee-content">
                    <span className="marquee-item">
                        ⚡ FREE SHIPPING AND RETURNS!!
                        <span className="mx-8">•</span>
                        NEW SEASON, NEW STYLES: FASHION SALE YOU CAN'T MISS
                        <span className="mx-8">•</span>
                        LIMITED TIME OFFER: FASHION SALE YOU CAN'T RESIST
                        <span className="mx-8">•</span>
                        FREE SHIPPING ON ORDERS OVER $50
                        <span className="mx-8">•</span>
                    </span>
                    <span className="marquee-item">
                        ⚡ FREE SHIPPING AND RETURNS!!
                        <span className="mx-8">•</span>
                        NEW SEASON, NEW STYLES: FASHION SALE YOU CAN'T MISS
                        <span className="mx-8">•</span>
                        LIMITED TIME OFFER: FASHION SALE YOU CAN'T RESIST
                        <span className="mx-8">•</span>
                        FREE SHIPPING ON ORDERS OVER $50
                        <span className="mx-8">•</span>
                    </span>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/30 rounded-full p-1.5 transition-colors border border-white/30"
                    aria-label="Close banner"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-royal-red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <style jsx>{`
                .marquee-container {
                    display: flex;
                    width: 100%;
                }

                .marquee-content {
                    display: flex;
                    animation: marquee 30s linear infinite;
                    white-space: nowrap;
                }

                .marquee-item {
                    display: inline-flex;
                    align-items: center;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .marquee-content:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default TopMarquee;
