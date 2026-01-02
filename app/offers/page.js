"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import TopMarquee from "@/components/TopMarquee";

// Dummy product data for offers
const dummyProducts = [
    {
        id: 1,
        name: "Men's 505 Mid Indigo Straight Fit Mid Rise Jeans",
        brand: "Levi's",
        price: 1835,
        originalPrice: 3999,
        discount: 46,
        images: ["/products/jeans1.png", "/products/jeans1.png"],
        colors: ["#1e3a8a", "#475569", "#64748b"],
        rating: 4.5,
        reviews: 234,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 2,
        name: "Men's Brand Logo Black Crew Neck Sweatshirt",
        brand: "Nike",
        price: 1181,
        originalPrice: 2149,
        discount: 45,
        images: ["/products/sweatshirt_black.png", "/products/sweatshirt_black.png"],
        colors: ["#000000", "#1e3a8a"],
        rating: 4.3,
        reviews: 156,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 3,
        name: "Men's Typographic Print Light Grey Slim Fit Sweatshirt",
        brand: "Adidas",
        price: 1181,
        originalPrice: 2149,
        discount: 45,
        images: ["/products/sweatshirt_grey.png", "/products/sweatshirt_grey.png"],
        colors: ["#9ca3af", "#ffffff"],
        rating: 4.4,
        reviews: 189,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 4,
        name: "Men's Tinted 568 Blue Loose Fit Mid Rise Jeans",
        brand: "Levi's",
        price: 1933,
        originalPrice: 3579,
        discount: 45,
        images: ["/products/jeans2.png", "/products/jeans2.png"],
        colors: ["#1e40af", "#475569"],
        rating: 4.6,
        reviews: 312,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 5,
        name: "Men's Slim Fit Casual Shirt",
        brand: "H&M",
        price: 899,
        originalPrice: 1999,
        discount: 55,
        images: ["/products/shirt.png", "/products/shirt.png"],
        colors: ["#ffffff", "#1e3a8a", "#dc2626"],
        rating: 4.2,
        reviews: 98,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 6,
        name: "Women's Floral Print Dress",
        brand: "Zara",
        price: 1499,
        originalPrice: 2999,
        discount: 50,
        images: ["/products/dress.png", "/products/dress.png"],
        colors: ["#ec4899", "#ffffff"],
        rating: 4.7,
        reviews: 267,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 7,
        name: "Men's Running Shoes",
        brand: "Nike",
        price: 2499,
        originalPrice: 4999,
        discount: 50,
        images: ["/products/shoes.png", "/products/shoes.png"],
        colors: ["#000000", "#ffffff", "#dc2626"],
        rating: 4.8,
        reviews: 445,
        sizes: ["7", "8", "9", "10"]
    },
    {
        id: 8,
        name: "Women's Denim Jacket",
        brand: "Levi's",
        price: 2199,
        originalPrice: 4499,
        discount: 51,
        images: ["/products/jacket.png", "/products/jacket.png"],
        colors: ["#1e40af", "#000000"],
        rating: 4.5,
        reviews: 178,
        sizes: ["S", "M", "L", "XL"]
    }
];

const quickFilters = ["BAGS", "BELTS", "CARGOS", "CHINOS", "JACKETS", "JEANS"];
const filterTabs = ["CATEGORIES", "STYLE", "SIZE", "PATTERN", "COLOR", "DISCOUNT"];
const preferenceOptions = ["CASUAL", "TAILORED"];

export default function OffersPage() {
    const [marqueeVisible, setMarqueeVisible] = useState(true);
    const [activeTab, setActiveTab] = useState("CATEGORIES");
    const [preferenceTab, setPreferenceTab] = useState("STYLE");
    const [sortBy, setSortBy] = useState("featured");

    return (
        <main className={`min-h-screen ${marqueeVisible ? 'pt-[88px] md:pt-[116px]' : 'pt-16 md:pt-20'} bg-white`}>
            <TopMarquee onClose={() => setMarqueeVisible(false)} />
            <Navbar marqueeVisible={marqueeVisible} />

            <div className="w-full">
                {/* Top Bar */}
                <div className="border-b border-gray-200">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                        <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:border-gray-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="4" y1="21" x2="4" y2="14"></line>
                                <line x1="4" y1="10" x2="4" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12" y2="3"></line>
                                <line x1="20" y1="21" x2="20" y2="16"></line>
                                <line x1="20" y1="12" x2="20" y2="3"></line>
                                <line x1="1" y1="14" x2="7" y2="14"></line>
                                <line x1="9" y1="8" x2="15" y2="8"></line>
                                <line x1="17" y1="16" x2="23" y2="16"></line>
                            </svg>
                            <span className="font-bold text-sm uppercase">Filters</span>
                        </button>

                        <h1 className="text-2xl md:text-3xl font-bold text-center flex-1">
                            END OF SEASON SALE - MEN
                        </h1>

                        <select
                            className="border border-gray-300 px-4 py-2 rounded text-sm focus:outline-none focus:border-gray-400"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="featured">Sort By: Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="discount">Discount</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>

                    <div className="text-right max-w-[1400px] mx-auto px-4 md:px-8 pb-3">
                        <p className="text-sm text-gray-600">Showing {dummyProducts.length} products</p>
                    </div>
                </div>

                {/* Filter For You Section - Single Row */}
                <div className="bg-[#f5f3ef] border-b border-gray-200">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
                        <div className="flex items-center gap-8">
                            {/* Left: Title */}
                            <h2 className="font-bold text-base uppercase whitespace-nowrap">Filter For You</h2>

                            {/* Center: Tabs and Pills */}
                            <div className="flex-1 flex flex-col items-center gap-3">
                                {/* Filter Tabs */}
                                <div className="flex items-center gap-6">
                                    {filterTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab
                                                ? "text-[var(--brand-royal-red)]"
                                                : "text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Category Pills */}
                                <div className="flex items-center gap-3 flex-wrap justify-center">
                                    {quickFilters.map((filter) => (
                                        <button
                                            key={filter}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:border-gray-400 transition-colors"
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                    <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-semibold text-[var(--brand-royal-red)] hover:border-gray-400 transition-colors">
                                        +More
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {dummyProducts.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

                {/* Tell Your Preference Section */}
                <div className="bg-[#f5f3ef] border-y border-gray-200">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
                        <div className="flex items-center gap-8">
                            <h2 className="font-bold text-base uppercase whitespace-nowrap">Tell Your Preference</h2>

                            <div className="flex-1 flex flex-col items-center gap-3">
                                {/* Preference Tabs */}
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setPreferenceTab("STYLE")}
                                        className={`text-sm font-semibold transition-colors ${preferenceTab === "STYLE"
                                            ? "text-[var(--brand-royal-red)]"
                                            : "text-gray-600"
                                            }`}
                                    >
                                        STYLE
                                    </button>
                                    <button
                                        onClick={() => setPreferenceTab("PATTERN")}
                                        className={`text-sm font-semibold transition-colors ${preferenceTab === "PATTERN"
                                            ? "text-[var(--brand-royal-red)]"
                                            : "text-gray-600"
                                            }`}
                                    >
                                        PATTERN
                                    </button>
                                </div>

                                {/* Preference Options */}
                                <div className="flex items-center gap-3">
                                    {preferenceOptions.map((option) => (
                                        <button
                                            key={option}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:border-gray-400 transition-colors"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* More Products */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {dummyProducts.slice(4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
