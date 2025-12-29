"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const ProductCard = ({ product, tag }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let interval;
        if (isHovered && product.images.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
            }, 1500); // Smooth sliding appreciation
        } else {
            setCurrentImageIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, product.images.length]);

    return (
        <div
            className="group relative cursor-pointer min-w-[280px] w-full" // Added min-w for horizontal scroll
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative h-[400px] w-full overflow-hidden bg-gray-100 rounded-sm">

                {/* Tag Badge (e.g., JUST IN) */}
                {tag && (
                    <div className="absolute top-0 left-0 bg-white/90 backdrop-blur-sm px-2 py-1 z-10">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-black">{tag}</span>
                    </div>
                )}

                {/* Sliding Track */}
                <div
                    className="absolute top-0 left-0 w-full h-full flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                    {product.images.map((img, index) => (
                        <div key={index} className="relative w-full h-full flex-shrink-0">
                            <Image
                                src={img}
                                alt={`${product.name} view ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    ))}
                </div>

                {/* Wishlist Icon */}
                <button className="absolute top-4 right-4 p-2 transition-opacity opacity-0 group-hover:opacity-100 text-gray-700 hover:text-black hover:bg-white/50 rounded-full z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>

                {/* Size Overlay - Clean Professional Look */}
                <div className={`absolute bottom-2 left-2 right-2 bg-white shadow-md px-4 py-3 transform transition-all duration-300 ease-out z-10 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                    <div className="flex justify-between items-center px-2">
                        {product.sizes.map((size) => {
                            const isUnavailable = product.unavailableSizes?.includes(size);
                            return (
                                <span
                                    key={size}
                                    className={`relative text-sm font-medium ${isUnavailable ? 'text-gray-300 cursor-not-allowed' : 'text-gray-800 hover:text-[var(--brand-royal-red)] cursor-pointer'}`}
                                >
                                    {size}
                                    {/* Strikethrough for unavailable */}
                                    {isUnavailable && (
                                        <span className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 -rotate-45 transform origin-center"></span>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="mt-3 px-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{product.brand}</h4>
                <h3 className="text-sm font-medium text-gray-900 truncate mb-1" title={product.name}>{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-gray-900">{product.price}</span>
                    <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                    <span className="text-xs text-[var(--brand-royal-red)] font-bold">({product.discount})</span>
                </div>

                {/* Color Dot */}
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border border-gray-200 p-[2px]`}>
                        <div className="w-full h-full rounded-full" style={{ backgroundColor: product.color }}></div>
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase">{product.color}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
