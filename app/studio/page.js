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
        type: "video",
        content: "/vid.mp4",
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
        type: "video",
        content: "https://res.cloudinary.com/demo/video/upload/v1689798029/samples/dance-2.mp4",
        description: "Gentlemen, elevate your formal game. 👔 #MensStyle #SuitedUp",
        likes: "856",
        products: [
            { id: 201, name: "Classic Navy Blazer", price: 5500, image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=200" },
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
        type: "video",
        content: "https://res.cloudinary.com/demo/video/upload/v1689798029/samples/sea-turtle.mp4",
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
        type: "video",
        content: "https://res.cloudinary.com/demo/video/upload/v1689798029/samples/elephants.mp4",
        description: "Streetwear aesthetic on point. 👟 #UrbanStyle #Sneakerhead",
        likes: "940",
        products: [
            { id: 401, name: "Oversized Hoodie", price: 2200, image: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=200" },
            { id: 402, name: "Cargo Pants", price: 1800, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=200" }
        ]
    },
    {
        id: 5,
        user: {
            name: "Traditional Tales",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100",
            time: "3 hours ago"
        },
        type: "video",
        content: "https://res.cloudinary.com/demo/video/upload/v1689798029/samples/cld-sample-video.mp4",
        description: "Elegance in every thread. 🌸 #TraditionalWear #Saree",
        likes: "3.1k",
        products: [
            { id: 501, name: "Silk Saree", price: 12500, image: "https://images.unsplash.com/photo-1583391733958-e026b1346331?auto=format&fit=crop&q=80&w=200" },
            { id: 502, name: "Gold Necklace", price: 1500, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200" }
        ]
    }
];

export default function StudioPage() {
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

// Single Post Component with Click-to-Expand
function StudioPost({ post }) {
    const [liked, setLiked] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const cardRef = React.useRef(null);

    // Click outside to collapse
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (expanded && cardRef.current && !cardRef.current.contains(event.target)) {
                setExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [expanded]);

    return (
        <div ref={cardRef} className="bg-white md:rounded-xl shadow-sm border-b md:border border-gray-100 overflow-hidden break-inside-avoid mb-6">
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

            {/* Clickable Media Area */}
            <div
                className="relative aspect-[4/5] w-full bg-gray-100 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {post.type === "video" ? (
                    <video
                        src={post.content}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : (
                    <Image
                        src={post.content}
                        alt={post.description}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                )}

                {/* Tap to View Indicator - Only show when collapsed */}
                {!expanded && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-full">
                        <ShoppingBag size={14} />
                        <span>Tap to view {post.products.length} products</span>
                    </div>
                )}

                {/* Overlay Action Buttons */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                        className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                        <Heart size={20} className={liked ? "fill-red-500 text-red-500" : "text-gray-800"} />
                    </button>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                        <Share2 size={20} className="text-gray-800" />
                    </button>
                </div>

                {/* Collapse hint when expanded */}
                {expanded && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-full">
                        <span>Tap to collapse</span>
                    </div>
                )}
            </div>

            {/* Expandable Post Details */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-3 md:p-4">
                    {/* Likes */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border border-white" />
                            ))}
                        </div>
                        <span className="text-xs font-medium text-gray-600">{post.likes} likes</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                        <span className="font-bold mr-1">{post.user.name}</span>
                        {post.description}
                    </p>

                    {/* Shop The Look Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shop The Look</h4>
                            <span className="text-xs text-[#ff3f6c] font-medium">{post.products.length} items</span>
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
                                        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur rounded-md px-2 py-1.5 text-center">
                                            <p className="text-xs font-bold text-[var(--brand-royal-red)]">৳{product.price}</p>
                                        </div>
                                    </div>
                                    <h5 className="text-xs font-medium text-gray-900 truncate">{product.name}</h5>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsed Mini Preview */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!expanded ? "max-h-16 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-3 md:px-4 py-2 flex items-center justify-between border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <Heart size={16} className={liked ? "fill-red-500 text-red-500" : "text-gray-400"} />
                        <span className="text-xs font-medium text-gray-500">{post.likes} likes</span>
                    </div>
                    <p className="text-xs text-gray-600 truncate max-w-[60%]">{post.description}</p>
                </div>
            </div>
        </div>
    );
}
