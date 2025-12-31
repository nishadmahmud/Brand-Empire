"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const CategoryBanner = ({ image, category, title, link }) => {
    return (
        <Link href={link} className="block relative h-[300px] md:h-[400px] group overflow-hidden rounded-lg">
            <Image
                src={image}
                alt={category}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest mb-2 text-gray-300">
                    {category}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {title}
                </h3>
                <button className="bg-white text-black px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-[var(--brand-royal-red)] hover:text-white transition-colors">
                    Shop Now
                </button>
            </div>
        </Link>
    );
};

const TrendingSection = () => {
    const trendingCategories = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=1000&auto=format&fit=crop",
            category: "MEN'S FASHION",
            title: "Formal Suits & Blazers",
            link: "/category/men"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
            category: "WOMEN'S COLLECTION",
            title: "Summer Dresses",
            link: "/category/women"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
            category: "ACCESSORIES",
            title: "Trending Bags & Shoes",
            link: "/category/accessories"
        }
    ];

    return (
        <section className="section-content py-12 md:py-16">
            <h2 className="text-lg md:text-xl font-bold mb-6 md:mb-8 uppercase tracking-widest text-gray-900">
                Trending Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingCategories.map((category) => (
                    <CategoryBanner key={category.id} {...category} />
                ))}
            </div>
        </section>
    );
};

export default TrendingSection;
