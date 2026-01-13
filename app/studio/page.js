"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Share2, Bookmark, ShoppingBag, ArrowLeft, Play, Pause } from "lucide-react";
import { getStudioList } from "@/lib/api";

export default function StudioPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudioPosts = async () => {
            try {
                const response = await getStudioList();
                if (response.success && response.data?.data) {
                    // Transform API data to component format
                    const transformedPosts = response.data.data.map((item) => ({
                        id: item.id,
                        user: {
                            name: item.vendor?.name || "Brand Empire",
                            avatar: item.vendor?.vendor_logo || item.vendor?.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(item.vendor?.name || "BE"),
                            time: formatTimeAgo(item.created_at)
                        },
                        type: "video",
                        content: item.video_link,
                        description: item.description || "",
                        likes: Math.floor(Math.random() * 1000) + 100, // Placeholder since API doesn't have likes
                        products: item.products?.map(product => ({
                            id: product.id,
                            name: product.name,
                            price: calculateDiscountedPrice(product.retails_price, product.discount),
                            originalPrice: product.retails_price,
                            discount: product.discount,
                            image: product.image_path
                        })) || []
                    }));
                    setPosts(transformedPosts);
                }
            } catch (error) {
                console.error("Error fetching studio posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudioPosts();
    }, []);

    // Helper function to format time ago
    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    }

    // Helper function to calculate discounted price
    function calculateDiscountedPrice(price, discount) {
        if (!discount) return price;
        return Math.round(price - (price * discount / 100));
    }

    if (loading) {
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
                    </div>
                </div>
                {/* Loading State */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="md:columns-2 gap-6 space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden break-inside-avoid mb-6">
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                                    <div className="flex-1">
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-16 bg-gray-100 rounded mt-1 animate-pulse" />
                                    </div>
                                </div>
                                <div className="aspect-[4/5] bg-gray-200 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
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
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag size={40} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Studio Posts Yet</h2>
                    <p className="text-gray-500">Check back later for new style inspiration!</p>
                </div>
            </div>
        );
    }

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
                    {posts.map((post) => (
                        <StudioPost key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Single Post Component with Click-to-Expand
function StudioPost({ post }) {
    const [expanded, setExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const cardRef = React.useRef(null);
    const videoRef = React.useRef(null);

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

    const togglePlayPause = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div ref={cardRef} className="bg-white md:rounded-xl shadow-sm border-b md:border border-gray-100 overflow-hidden break-inside-avoid mb-6">
            {/* Post Header */}
            <div className="p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-gray-100">
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
                        ref={videoRef}
                        src={post.content}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
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
                {!expanded && post.products.length > 0 && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-full">
                        <ShoppingBag size={14} />
                        <span>Tap to view {post.products.length} products</span>
                    </div>
                )}

                {/* Overlay Action Buttons */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-3">
                    {/* Play/Pause Button - Only for videos */}
                    {post.type === "video" && (
                        <button
                            onClick={togglePlayPause}
                            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                            {isPlaying ? (
                                <Pause size={20} className="text-gray-800" />
                            ) : (
                                <Play size={20} className="text-gray-800 ml-0.5" />
                            )}
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (navigator.share) {
                                navigator.share({
                                    title: post.user.name,
                                    text: post.description,
                                    url: window.location.href
                                });
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied to clipboard!');
                            }
                        }}
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
                    {/* Description */}
                    {post.description && (
                        <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                            <span className="font-bold mr-1">{post.user.name}</span>
                            {post.description}
                        </p>
                    )}

                    {/* Shop The Look Slider */}
                    {post.products.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shop The Look</h4>
                                <span className="text-xs text-[#ff3f6c] font-medium">{post.products.length} items</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {post.products.map((product) => (
                                    <Link key={product.id} href={`/product/${product.id}`} className="flex-shrink-0 w-[130px] group">
                                        <div className="relative w-full h-[160px] rounded-lg overflow-hidden bg-gray-50 mb-2 border border-gray-100">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                                unoptimized
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur px-2 py-1.5 text-center">
                                                <p className="text-xs font-bold text-[var(--brand-royal-red)]">৳{product.price}</p>
                                                {product.discount > 0 && (
                                                    <p className="text-[10px] text-gray-400 line-through">৳{product.originalPrice}</p>
                                                )}
                                            </div>
                                        </div>
                                        <h5 className="text-xs font-medium text-gray-900 line-clamp-2 h-8">{product.name}</h5>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapsed Mini Preview */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!expanded ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-3 md:px-4 py-3 border-t border-gray-50">
                    <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                        <span className="font-bold mr-1">{post.user.name}</span>
                        {post.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
