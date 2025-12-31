"use client";

import React from "react";
import Image from "next/image";

const CollectionCard = ({ image, video, title, alt, subtitle, buttonText, theme, alignment, type = 'image' }) => {
    const [videoError, setVideoError] = React.useState(false);

    return (
        <div className="relative h-[350px] md:h-[450px] lg:h-[500px] w-full group overflow-hidden cursor-pointer">
            {/* Conditional rendering: Video or Image */}
            {type === 'video' && video && !videoError ? (
                <video
                    src={video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onError={() => setVideoError(true)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <Image
                    src={image}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                />
            )}

            {/* Overlay Gradient based on theme */}
            <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black/80 via-black/20 to-transparent' :
                theme === 'light' ? 'from-white/10 via-transparent to-transparent' :
                    'from-black/60 via-transparent to-transparent'
                }`} />

            <div className={`absolute bottom-6 md:bottom-10 ${alignment === 'left' ? 'left-4 md:left-8 text-left' : 'left-4 md:left-8 text-left'} w-full pr-4 md:pr-8`}>
                {/* Subtitle */}
                <p className={`text-xs md:text-sm font-bold uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>
                    {subtitle}
                </p>

                {/* Title */}
                <h3 className={`text-2xl md:text-4xl font-serif mb-4 md:mb-6 leading-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    <span dangerouslySetInnerHTML={{ __html: title }} />
                </h3>

                {/* Button */}
                <button className={`px-6 md:px-8 py-2 md:py-3 font-bold text-xs tracking-widest uppercase transition-colors ${theme === 'light'
                    ? 'bg-gray-900 text-white hover:bg-[var(--brand-royal-red)]'
                    : 'bg-white text-black hover:bg-[var(--brand-royal-red)] hover:text-white'
                    }`}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

const FeaturedCollections = () => {
    const collections = [
        {
            id: 1,
            type: 'image',
            image: "https://images.unsplash.com/photo-1519199631849-f1e1be711df1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "OUR TOP 100 <br/> <span class='italic font-normal'>Best Sellers</span>",
            subtitle: "TRENDING NOW",
            alt: "Best Sellers Collection",
            buttonText: "SHOP NOW",
            theme: "dark",
            alignment: "left"
        },
        {
            id: 2,
            type: 'video',
            video: "/vid.mp4",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1170&auto=format&fit=crop",
            title: "SUMMER <br/> <span class='italic font-normal'>Collection 2024</span>",
            subtitle: "NEW ARRIVALS",
            alt: "Summer Collection",
            buttonText: "EXPLORE",
            theme: "dark",
            alignment: "left"
        },
        {
            id: 3,
            type: 'image',
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "EXCLUSIVE <br/> <span class='italic font-normal'>Designer Wear</span>",
            subtitle: "PREMIUM COLLECTION",
            alt: "Designer Collection",
            buttonText: "DISCOVER",
            theme: "light",
            alignment: "left"
        }
    ];

    return (
        <section className="section-content py-12 md:py-16">
            <h2 className="text-lg md:text-xl font-bold mb-6 md:mb-8 uppercase tracking-widest text-gray-900">
                Featured Collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {collections.map((collection) => (
                    <CollectionCard key={collection.id} {...collection} />
                ))}
            </div>
        </section>
    );
};

export default FeaturedCollections;
