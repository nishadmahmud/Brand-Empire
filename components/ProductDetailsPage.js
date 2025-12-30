"use client";

import React, { useState } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import { dummyProduct, similarProducts, customersAlsoLiked } from "@/data/productData";

const ProductDetailsPage = () => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [pincode, setPincode] = useState("");
    const [showOffers, setShowOffers] = useState(false);

    const product = dummyProduct;

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="w-[90%] max-w-[1600px] mx-auto py-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <a href="/" className="hover:text-black">Home</a>
                    <span>/</span>
                    <a href="/category/men" className="hover:text-black">Clothing</a>
                    <span>/</span>
                    <a href="/category/men" className="hover:text-black">Men Clothing</a>
                    <span>/</span>
                    <a href="/category/men" className="hover:text-black">Shirts</a>
                    <span>/</span>
                    <span className="text-black font-medium">{product.brand} Shirts</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-[90%] max-w-[1600px] mx-auto py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative w-full h-[500px] md:h-[600px] bg-gray-100 rounded">
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-cover rounded"
                                unoptimized
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-6 gap-2">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative h-20 bg-gray-100 rounded border-2 transition-all ${selectedImage === index
                                        ? 'border-[var(--brand-royal-red)]'
                                        : 'border-transparent hover:border-gray-300'
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`View ${index + 1}`}
                                        fill
                                        className="object-cover rounded"
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-6">
                        {/* Brand & Title */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">{product.brand}</h2>
                            <h1 className="text-lg text-gray-600">{product.name}</h1>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm font-bold">
                                <span>{product.rating}</span>
                                <span>★</span>
                            </div>
                            <span className="text-sm text-gray-600">{product.reviewCount} Ratings</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                            <span className="text-2xl font-bold text-gray-900">৳{product.price}</span>
                            <span className="text-lg text-gray-400 line-through">MRP ৳{product.mrp}</span>
                            <span className="text-[var(--brand-royal-red)] font-bold">({product.discount}% OFF)</span>
                        </div>
                        <p className="text-xs text-green-600 font-medium -mt-4">inclusive of all taxes</p>

                        {/* Size Selector */}
                        <div className="pb-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold uppercase">Select Size</h3>
                                <button className="text-sm text-[var(--brand-royal-red)] font-bold hover:underline">
                                    SIZE CHART →
                                </button>
                            </div>
                            <div className="flex gap-3">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-14 rounded-full border-2 font-bold transition-all ${selectedSize === size
                                            ? 'border-[var(--brand-royal-red)] text-[var(--brand-royal-red)]'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button className="flex-1 bg-[var(--brand-royal-red)] text-white py-4 rounded font-bold text-sm uppercase hover:bg-[#a01830] transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                Add to Bag
                            </button>
                            <button className="px-6 py-4 border-2 border-gray-300 rounded font-bold text-sm uppercase hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                Wishlist
                            </button>
                        </div>

                        {/* Delivery Options */}
                        <div className="pb-6 border-b border-gray-200">
                            <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13"></rect>
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                </svg>
                                Delivery Options
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--brand-royal-red)]"
                                />
                                <button className="px-6 py-2 text-[var(--brand-royal-red)] font-bold border border-[var(--brand-royal-red)] rounded hover:bg-red-50 transition-colors">
                                    Check
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Please enter PIN code to check delivery time & Pay on Delivery Availability</p>
                            <div className="mt-4 space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>100% Original Products</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Pay on delivery might be available</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Easy 14 days returns and exchanges</span>
                                </p>
                            </div>
                        </div>

                        {/* Best Offers */}
                        <div className="pb-6 border-b border-gray-200">
                            <button
                                onClick={() => setShowOffers(!showOffers)}
                                className="w-full flex items-center justify-between text-sm font-bold uppercase mb-4"
                            >
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                    </svg>
                                    Best Offers
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-transform ${showOffers ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            {showOffers && (
                                <div className="space-y-4">
                                    {product.offers.map((offer, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200">
                                            <p className="text-sm font-bold mb-1">Best Price: ৳{product.price}</p>
                                            {offer.code && (
                                                <p className="text-sm mb-1">
                                                    Coupon code: <span className="font-bold">{offer.code}</span>
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600">{offer.title}</p>
                                            {offer.discount && (
                                                <p className="text-sm text-gray-600">{offer.discount}</p>
                                            )}
                                            {offer.minSpend && (
                                                <p className="text-sm text-gray-600">
                                                    Min Spend {offer.minSpend}, Max Discount {offer.maxDiscount}
                                                </p>
                                            )}
                                            <button className="text-[var(--brand-royal-red)] text-sm font-bold mt-2 hover:underline">
                                                Terms & Condition
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Details Section */}
                <ProductDetailsSection product={product} />

                {/* Similar Products */}
                <SimilarProductsSection products={similarProducts} />

                {/* Customers Also Liked */}
                <CustomersAlsoLikedSection products={customersAlsoLiked} />
            </div>
        </div>
    );
};

// Product Details Section Component
const ProductDetailsSection = ({ product }) => {
    const [activeTab, setActiveTab] = useState('details');

    return (
        <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="space-y-6">
                {/* Product Details */}
                <details open className="border-b border-gray-200 pb-6">
                    <summary className="text-sm font-bold uppercase cursor-pointer flex items-center justify-between">
                        <span>Product Details</span>
                    </summary>
                    <div className="mt-4 text-sm text-gray-700 space-y-2">
                        <p>{product.description}</p>
                        <div className="mt-4">
                            <h4 className="font-bold mb-2">Size & Fit</h4>
                            <p>{product.details.fit}</p>
                            <p>Size worn by the model: {product.details.sizeWornByModel}</p>
                            <p>Chest: {product.details.modelStats.chest}</p>
                            <p>Height: {product.details.modelStats.height}</p>
                        </div>
                    </div>
                </details>

                {/* Material & Care */}
                <details className="border-b border-gray-200 pb-6">
                    <summary className="text-sm font-bold uppercase cursor-pointer">Material & Care</summary>
                    <div className="mt-4 text-sm text-gray-700">
                        <p>{product.materialCare.material}</p>
                        <p>{product.materialCare.wash}</p>
                    </div>
                </details>

                {/* Specifications */}
                <details className="border-b border-gray-200 pb-6">
                    <summary className="text-sm font-bold uppercase cursor-pointer">Specifications</summary>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span className="font-medium">{value}</span>
                            </div>
                        ))}
                    </div>
                </details>

                {/* Ratings & Reviews */}
                <RatingsSection product={product} />
            </div>
        </div>
    );
};

// Ratings Section Component
const RatingsSection = ({ product }) => {
    const totalReviews = Object.values(product.ratings).reduce((a, b) => a + b, 0);

    return (
        <details open className="border-b border-gray-200 pb-6">
            <summary className="text-sm font-bold uppercase cursor-pointer flex items-center gap-2">
                <span>Ratings</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </summary>
            <div className="mt-6">
                {/* Rating Summary */}
                <div className="flex items-start gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold mb-1">{product.rating} ★</div>
                        <p className="text-sm text-gray-600">{totalReviews} Verified Buyers</p>
                    </div>
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-sm w-4">{star}</span>
                                <span className="text-gray-400">★</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-600"
                                        style={{ width: `${(product.ratings[star] / totalReviews) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-8">{product.ratings[star]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer Reviews */}
                <div className="space-y-6">
                    <h4 className="font-bold text-sm uppercase">Customer Reviews ({product.reviews.length})</h4>
                    {product.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded flex items-center gap-1">
                                    <span>{review.rating}</span>
                                    <span>★</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{review.text}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{review.author} | {review.date}</span>
                                <button className="flex items-center gap-1 hover:text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                    </svg>
                                    <span>{review.helpful}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    <button className="text-[var(--brand-royal-red)] font-bold text-sm hover:underline">
                        View all {product.reviewCount} reviews
                    </button>
                </div>
            </div>
        </details>
    );
};

// Similar Products Section
const SimilarProductsSection = ({ products }) => {
    // Format products for ProductCard
    const formatProduct = (product) => ({
        id: product.id,
        brand: product.brand,
        name: product.name,
        price: `৳ ${product.price.toLocaleString()}`,
        originalPrice: product.mrp > 0 ? `৳ ${product.mrp.toLocaleString()}` : "",
        discount: product.discount > 0 ? `${product.discount}% OFF` : "",
        images: [product.image],
        sizes: ["S", "M", "L", "XL"],
        color: "#000000",
    });

    return (
        <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold mb-6 uppercase">Similar Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={formatProduct(product)} />
                ))}
            </div>
        </div>
    );
};

// Customers Also Liked Section
const CustomersAlsoLikedSection = ({ products }) => {
    // Format products for ProductCard
    const formatProduct = (product) => ({
        id: product.id,
        brand: product.brand,
        name: product.name,
        price: `৳ ${product.price.toLocaleString()}`,
        originalPrice: product.mrp > 0 ? `৳ ${product.mrp.toLocaleString()}` : "",
        discount: product.discount > 0 ? `${product.discount}% OFF` : "",
        images: [product.image],
        sizes: ["30", "32", "34", "36"],
        color: "#000000",
    });

    return (
        <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold mb-6 uppercase">Customers Also Liked</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={formatProduct(product)} />
                ))}
            </div>
        </div>
    );
};

export default ProductDetailsPage;
