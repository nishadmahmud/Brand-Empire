"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Share2, Bookmark, Play, ShoppingBag, ArrowLeft } from "lucide-react";

// Mock Data for Studio Posts
const STUDIO_POSTS = [
    {
        id: 1,
        user: {
            name: "Style with Sarah",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
            time: "2 hours ago"
        },
        type: "image",
        content: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
        description: "Summer vibes in this stunning red dress! ❤️ #SummerFashion #BrandEmpire",
        likes: "1.2k",
        products: [
            { id: 101, name: "Red Summer Dress", price: 2500, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200" },
            { id: 102, name: "Gold Earrings", price: 450, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=200" }
        ]
    },
    {
        id: 2,
        user: {
            name: "Mens Fashion Hub",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
            time: "5 hours ago"
        },
        type: "image",
        content: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800",
        description: "Gentlemen, elevate your formal game. 👔 #MensStyle #SuitedUp",
        likes: "856",
        products: [
            { id: 201, name: "Classic Navy Blazer", price: 5500, image: "https://images.unsplash.com/photo-1594938298603-c8148c47e356?auto=format&fit=crop&q=80&w=200" },
            { id: 202, name: "White Oxford Shirt", price: 1800, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200" }
        ]
    },
    {
        id: 3,
        user: {
            name: "Makeup by Mina",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
            time: "1 day ago"
        },
        type: "image", // Could be video in future
        content: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=800",
        description: "Get the perfect glow with these essentials! ✨ #BeautyDrill #GlowUp",
        likes: "2.5k",
        products: [
            { id: 301, name: "Liquid Foundation", price: 1200, image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=80&w=200" },
            { id: 302, name: "Matte Lipstick", price: 650, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200" }
        ]
    },
    {
        id: 4,
        user: {
            name: "Urban Street",
            avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100",
            time: "Just now"
        },
        type: "image",
        content: "https://images.unsplash.com/photo-1550614000-4b9519e007d9?auto=format&fit=crop&q=80&w=800",
        description: "Streetwear aesthetic on point. 👟 #UrbanStyle #Sneakerhead",
        likes: "940",
        products: [
            { id: 401, name: "Oversized Hoodie", price: 2200, image: "https://images.unsplash.com/photo-1556906781-9a412961d289?auto=format&fit=crop&q=80&w=200" },
            { id: 402, name: "Cargo Pants", price: 1800, image: "https://images.unsplash.com/photo-1517445312582-553941401b97?auto=format&fit=crop&q=80&w=200" }
        ]
    },
    {
        id: 5,
        user: {
            name: "Traditional Tales",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100",
            time: "3 hours ago"
        },
        type: "image",
        content: "https://images.unsplash.com/photo-1583391733958-e026b1346331?auto=format&fit=crop&q=80&w=800",
        description: "Elegance in every thread. 🌸 #TraditionalWear #Saree",
        likes: "3.1k",
        products: [
            { id: 501, name: "Silk Saree", price: 12500, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200" },
            { id: 502, name: "Gold Necklace", price: 1500, image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=200" }
        ]
    }
];

export default function StudioPage() {
    const [activeTab, setActiveTab] = useState("all");

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="md:hidden">
                            <ArrowLeft size={24} className="text-gray-700" />
                        </Link>
                        <div className="flex items-baseline gap-1">
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Brand</h1>
                            <span className="text-[10px] uppercase tracking-widest text-[#ff3f6c] font-bold">Studio</span>
                            <span className="bg-yellow-400 text-[10px] font-bold px-1 rounded text-black ml-1">NEW</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                            <Bookmark size={20} />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                            <ShoppingBag size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-b overflow-x-auto scrollbar-hide">
                <div className="max-w-4xl mx-auto px-4 flex gap-6 md:gap-8 items-center h-12">
                    {["For You", "Following", "Trending", "Masterclass", "Celeb Style"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap text-sm font-medium transition-colors relative h-full flex items-center ${activeTab === tab ? "text-[#ff3f6c]" : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff3f6c] rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed Content */}
            <div className="max-w-4xl mx-auto px-0 md:px-4 py-4 md:py-6">
                <div className="md:columns-2 gap-6 space-y-6">
                    {STUDIO_POSTS.map((post) => (
                        <StudioPost key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Single Post Component
function StudioPost({ post }) {
    const [liked, setLiked] = useState(false);

    return (
        <div className="bg-white md:rounded-xl shadow-sm border-b md:border border-gray-100 overflow-hidden break-inside-avoid mb-6">
            {/* Post Header */}
            <div className="p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                        <Image
                            src={post.user.avatar}
                            alt={post.user.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900 leading-none">{post.user.name}</h3>
                        <p className="text-[10px] text-gray-500 mt-1">{post.user.time}</p>
                    </div>
                </div>
                <button className="text-[var(--brand-royal-red)] text-xs font-bold border border-[var(--brand-royal-red)] px-3 py-1 rounded-full hover:bg-red-50 transition-colors">
                    + Follow
                </button>
            </div>

            {/* Interaction Bar (Top of Image - Myntra style sometimes overlays, but we'll stick to bottom or side)
                Actually Myntra Studio often has content full width.
            */}

            <div className="relative aspect-[4/5] w-full bg-gray-100">
                <Image
                    src={post.content}
                    alt={post.description}
                    fill
                    className="object-cover"
                    unoptimized
                />

                {/* Overlay Action Buttons */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-3">
                    <button
                        onClick={() => setLiked(!liked)}
                        className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                        <Heart size={20} className={liked ? "fill-red-500 text-red-500" : "text-gray-800"} />
                    </button>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Share2 size={20} className="text-gray-800" />
                    </button>
                </div>
            </div>

            {/* Post Details */}
            <div className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border border-white" />
                        ))}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{post.likes} likes</span>
                </div>

                <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                    <span className="font-bold mr-1">{post.user.name}</span>
                    {post.description}
                </p>

                {/* Shop The Look Slider */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shop The Look</h4>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {post.products.map((product) => (
                            <Link key={product.id} href={`/product/${product.id}`} className="min-w-[120px] md:min-w-[140px] group">
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 mb-2 border border-gray-100">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                        unoptimized
                                    />
                                </div>
                                <h5 className="text-xs font-medium text-gray-900 truncate">{product.name}</h5>
                                <p className="text-xs font-bold text-gray-900">৳{product.price}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
