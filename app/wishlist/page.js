"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";

const WishlistPage = () => {
    const { wishlist } = useWishlist();

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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-8 gap-x-4 md:gap-x-8">
                        {wishlist.map((product) => (
                            <ProductCard key={product.id} product={product} />
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
