"use client";

import React from "react";
import Image from "next/image";

const AppPromoSection = () => {
    return (
        <section className="section-full bg-[#1a1a1a] py-12 mt-16">
            <div className="section-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Text & Download Options */}
                    <div className="text-white">
                        <h2 className="text-3xl font-bold mb-4 uppercase tracking-wide">
                            GET FLAT 10% OFF ON APP AND WEB
                        </h2>
                        <p className="text-gray-300 mb-6 text-base leading-relaxed">
                            Download the Brand Empire App and get<br />
                            Flat 10% off on your first purchase. Use<br />
                            Code <span className="font-bold text-white">BEFIRST10</span>. T&C applies!
                        </p>

                        {/* App Store Buttons - Real Badges */}
                        <div className="flex gap-3 mb-6">
                            <a
                                href="#"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <Image
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                    alt="Download on App Store"
                                    width={135}
                                    height={40}
                                    unoptimized
                                />
                            </a>

                            <a
                                href="#"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <Image
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                    alt="Get it on Google Play"
                                    width={135}
                                    height={40}
                                    unoptimized
                                />
                            </a>
                        </div>

                        {/* Real QR Code */}
                        <div className="inline-block bg-white p-3 rounded-lg">
                            <Image
                                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://brandempire.com"
                                alt="QR Code"
                                width={120}
                                height={120}
                                unoptimized
                            />
                        </div>
                    </div>

                    {/* Right Side - Phone Mockup */}
                    <div className="flex justify-center md:justify-end">
                        <div className="relative">
                            {/* Phone Frame - Reduced Size */}
                            <div className="relative w-[240px] h-[480px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-[36px] p-2.5 shadow-2xl">
                                {/* Screen */}
                                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 rounded-[30px] flex items-center justify-center overflow-hidden">
                                    {/* App Icon with Brand Empire Logo */}
                                    <div className="bg-white rounded-3xl p-6 shadow-xl">
                                        <Image
                                            src="/logo.png"
                                            alt="Brand Empire"
                                            width={80}
                                            height={80}
                                            unoptimized
                                        />
                                    </div>
                                </div>

                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-3xl"></div>
                            </div>

                            {/* Hand holding phone effect - decorative shadow */}
                            <div className="absolute -bottom-3 -right-3 w-20 h-28 bg-gradient-to-br from-gray-600/20 to-transparent rounded-full blur-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppPromoSection;
