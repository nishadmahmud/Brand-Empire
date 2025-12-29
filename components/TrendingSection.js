"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";

const dummyProducts = [
    {
        id: 1,
        brand: "FORMAL SUITS",
        name: "Men Blue Solid Formal Two Piece Suit",
        price: "₹ 5,793",
        originalPrice: "₹ 11,999",
        discount: "51% OFF",
        images: [
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop", // Front
            "https://images.unsplash.com/photo-1594938328870-9623159c8c99?q=80&w=1000&auto=format&fit=crop", // Detail
            "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?q=80&w=1000&auto=format&fit=crop", // Full body
        ],
        sizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
        unavailableSizes: ["48", "50"],
        color: "blue",
    },
    {
        id: 2,
        brand: "SWEATERS",
        name: "Men Brown Solid V Neck Sweater",
        price: "₹ 1,044",
        originalPrice: "₹ 1,899",
        discount: "45% OFF",
        images: [
            "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        unavailableSizes: ["XXL"],
        color: "brown",
    },
    {
        id: 3,
        brand: "JACKETS",
        name: "Men Olive Solid Casual Jacket",
        price: "₹ 2,362",
        originalPrice: "₹ 2,625",
        discount: "10% OFF",
        images: [
            "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512353087810-25dfcd100962?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["M", "L", "XL"],
        unavailableSizes: [],
        color: "olive",
    },
    {
        id: 4,
        brand: "FORMAL SHIRTS",
        name: "Men Blue Regular Fit Full Sleeves Formal Shirt",
        price: "₹ 1,799",
        originalPrice: "₹ 1,999",
        discount: "10% OFF",
        images: [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["39", "40", "42", "44"],
        unavailableSizes: ["39"],
        color: "blue",
    },
];



const TrendingSection = () => {
    return (
        <section className="section-content py-12 md:py-16">
            <h2 className="text-lg md:text-2xl font-bold mb-6 md:mb-8 uppercase tracking-widest text-gray-900 relative">
                Trending Now
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {dummyProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default TrendingSection;
