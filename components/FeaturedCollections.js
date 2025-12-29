"use client";

import React from "react";
import Image from "next/image";

const CollectionCard = ({ image, title, alt, subtitle, buttonText, theme, alignment }) => {
    return (
        <div className="relative h-[350px] md:h-[450px] lg:h-[500px] w-full group overflow-hidden cursor-pointer">
            <Image
                src={image}
                alt={alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
            />
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
            image: "https://images.unsplash.com/photo-1519199631849-f1e1be711df1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Denim/Beige vibe
            title: "OUR TOP 100 <br/> <span class='italic font-normal'>Best Sellers</span>",
            alt: "Top 100 Best Sellers Denim Collection",
            subtitle: "Don't Miss Out",
            buttonText: "Shop Now",
            theme: "light", // Text will be dark
            alignment: "left",
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop", // Party/Dark vibe (Shirt)
            title: "LOOKS <br/> <span class='italic font-normal'>That Say TGIF!</span>",
            alt: "Partywear Shirts Collection",
            subtitle: "Partywear Shirts",
            buttonText: "View Collection",
            theme: "dark", // Text will be white
            alignment: "left",
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?q=80&w=1000&auto=format&fit=crop", // Winter/Cold vibe
            title: "HOT BESTSELLERS <br/> <span class='font-sans font-bold text-2xl'>FOR THE COLD SEASON</span>",
            alt: "Winter Jackets Collection",
            subtitle: "Winter Essentials",
            buttonText: "Shop Jackets",
            theme: "dark",
            alignment: "left",
        },
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
