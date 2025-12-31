"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const CategoryCard = ({ image, title, link }) => {
    return (
        <Link href={link} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm mb-3">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                />
            </div>
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-center text-gray-900">
                {title}
            </h3>
        </Link>
    );
};

const TrendingSection = () => {
    const trendingCategories = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop",
            title: "Men's Jeans",
            link: "/category/men"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?q=80&w=400&auto=format&fit=crop",
            title: "Women's Jeans",
            link: "/category/women"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop",
            title: "Men's Shirts",
            link: "/category/men"
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=400&auto=format&fit=crop",
            title: "Women's Tops",
            link: "/category/women"
        },
        {
            id: 5,
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop",
            title: "Men's Jackets",
            link: "/category/men"
        },
        {
            id: 6,
            image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=400&auto=format&fit=crop",
            title: "Women's Jackets",
            link: "/category/women"
        }
    ];

    return (
        <section className="section-content py-12 md:py-16">
            <h2 className="text-lg md:text-xl font-bold mb-6 md:mb-8 uppercase tracking-widest text-gray-900">
                Trending Now
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                {trendingCategories.map((category) => (
                    <CategoryCard key={category.id} {...category} />
                ))}
            </div>
        </section>
    );
};

export default TrendingSection;
