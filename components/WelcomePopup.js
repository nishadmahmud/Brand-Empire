"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const WelcomePopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if popup has been shown in this session
        const hasSeenPopup = sessionStorage.getItem("welcomePopupShown");

        if (!hasSeenPopup) {
            // Show popup after a short delay
            const timer = setTimeout(() => {
                setIsVisible(true);
                sessionStorage.setItem("welcomePopupShown", "true");
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleShopNow = () => {
        setIsVisible(false);
        router.push("/category/all");
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="relative w-[90vw] max-w-4xl bg-white rounded-lg overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{
                    animation: "fadeInScale 0.4s ease-out"
                }}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-gray-900 p-2 rounded-full transition-all shadow-lg hover:scale-110"
                    aria-label="Close popup"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Popup Content */}
                <div className="relative">
                    {/* Background Image */}
                    <div className="relative w-full h-[500px]">
                        <Image
                            src="/welcome_popup_banner.png"
                            alt="Welcome to Brand Empire"
                            fill
                            className="object-cover"
                            unoptimized
                            priority
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>

                    {/* Text Content Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                        {/* Brand Logo/Text */}
                        <div className="mb-6">
                            <p className="text-white text-lg font-semibold tracking-wider mb-2 drop-shadow-lg">
                                Welcome to
                            </p>
                            <h1 className="text-white text-5xl md:text-6xl font-bold tracking-tight drop-shadow-2xl">
                                BRAND EMPIRE
                            </h1>
                        </div>

                        {/* Promotional Text */}
                        <div className="mb-8">
                            <h2 className="text-white text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">
                                New Season Collection
                            </h2>
                            <p className="text-white text-lg md:text-xl font-medium drop-shadow-lg">
                                Discover Premium Fashion & Exclusive Deals
                            </p>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={handleShopNow}
                            className="bg-white text-gray-900 px-10 py-4 text-lg font-bold uppercase tracking-wider rounded-md hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 hover:shadow-xl"
                        >
                            Shop Now
                        </button>

                        {/* Optional: Discount Badge */}
                        <div className="mt-6">
                            <span className="inline-block bg-[var(--brand-royal-red)] text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
                                Up to 50% Off
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation Keyframes */}
            <style jsx>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default WelcomePopup;
