"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

const WishlistPage = () => {
    const { wishlist, removeFromWishlist } = useWishlist();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-8 shadow-sm">
                <div className="max-w-[1400px] mx-auto text-center">
                    <h1 className="text-2xl font-extrabold uppercase tracking-widest mb-2">My Wishlist</h1>
                    <p className="text-sm text-gray-500">{wishlist.length} Items</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1400px] mx-auto px-4 py-8">
                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {wishlist.map((product) => (
                            <div key={product.id} className="relative group/card">
                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeFromWishlist(product.id);
                                    }}
                                    className="absolute top-2 right-2 z-20 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/card:opacity-100"
                                    title="Remove from wishlist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                                <Link href={`/product/${product.id}`} className="group">
                                    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                        <div className="relative aspect-square bg-gray-100">
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name || "Product"}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                        <polyline points="21 15 16 10 5 21"></polyline>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-[var(--brand-royal-red)]">৳{product.price}</span>
                                                {product.originalPrice && (
                                                    <span className="text-xs text-gray-400 line-through">৳{product.originalPrice}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md">Save items that you like in your wishlist. Review them anytime and easily move them to the bag.</p>
                        <Link href="/category/0" className="px-8 py-3 bg-[var(--brand-royal-red)] text-white font-bold uppercase tracking-wider rounded hover:bg-[#a01830] transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
