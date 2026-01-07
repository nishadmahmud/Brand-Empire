"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { getCampaigns } from "@/lib/api";

export default function CampaignPage() {
    const params = useParams();
    const campaignId = params.id;

    const [campaign, setCampaign] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("recommended");

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                setLoading(true);
                const response = await getCampaigns();

                if (response.success && response.campaigns?.data) {
                    const foundCampaign = response.campaigns.data.find(
                        c => c.id == campaignId
                    );

                    if (foundCampaign) {
                        setCampaign(foundCampaign);

                        // Transform products with campaign discounts
                        const transformedProducts = (foundCampaign.products || []).map(product => {
                            // Get discount from pivot (individual product discount in campaign)
                            const pivotDiscount = product.pivot?.discount || 0;
                            const discountType = product.pivot?.discount_type || 'percentage';

                            // Calculate final price based on discount type
                            let finalPrice = product.retails_price;
                            let discountText = '';

                            if (discountType === 'percentage' && pivotDiscount > 0) {
                                finalPrice = product.retails_price * (1 - pivotDiscount / 100);
                                discountText = `${pivotDiscount}% OFF`;
                            } else if (discountType === 'amount' && pivotDiscount > 0) {
                                finalPrice = product.retails_price - pivotDiscount;
                                discountText = `৳${pivotDiscount} OFF`;
                            }

                            return {
                                id: product.id,
                                brand: product.brands?.name || "BRAND",
                                name: product.name,
                                price: `৳ ${Math.round(finalPrice).toLocaleString()}`,
                                originalPrice: pivotDiscount > 0 ? `৳ ${product.retails_price.toLocaleString()}` : "",
                                discount: discountText,
                                images: product.image_paths && product.image_paths.length > 0
                                    ? product.image_paths
                                    : [product.image_path, product.image_path1, product.image_path2].filter(Boolean),
                                sizes: product.items && product.items.length > 0
                                    ? product.items.map(item => {
                                        const sizeAttr = item.attributes?.find(a => a.attribute?.type === 'size');
                                        return sizeAttr?.attribute_value?.value || '';
                                    }).filter(Boolean)
                                    : ["S", "M", "L", "XL"],
                                unavailableSizes: [],
                                color: product.color || "gray",
                                rating: product.review_summary?.average_rating || 0,
                                reviews: product.review_summary?.total_reviews || 0,
                                rawPrice: Math.round(finalPrice),
                                rawDiscount: pivotDiscount,
                            };
                        });

                        setProducts(transformedProducts);
                    }
                }
            } catch (error) {
                console.error("Error fetching campaign:", error);
            } finally {
                setLoading(false);
            }
        };

        if (campaignId) {
            fetchCampaign();
        }
    }, [campaignId]);

    // Apply sorting
    const sortedProducts = useMemo(() => {
        let result = [...products];

        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => a.rawPrice - b.rawPrice);
                break;
            case "price-high":
                result.sort((a, b) => b.rawPrice - a.rawPrice);
                break;
            case "discount":
                result.sort((a, b) => b.rawDiscount - a.rawDiscount);
                break;
            case "newest":
                result.reverse();
                break;
            default:
                break;
        }

        return result;
    }, [products, sortBy]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-royal-red)]"></div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <p className="text-gray-500 text-lg mb-4">Campaign not found</p>
                <Link href="/offers" className="text-[var(--brand-royal-red)] font-semibold hover:underline">
                    ← Back to Offers
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Campaign Banner */}
            {campaign.bg_image && (
                <div className="w-full bg-gray-100">
                    <div className="max-w-[1400px] mx-auto">
                        <img
                            src={campaign.bg_image}
                            alt={campaign.name}
                            className="w-full h-auto max-h-48 md:max-h-64 object-contain mx-auto"
                        />
                    </div>
                </div>
            )}

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-[var(--brand-royal-red)]">Home</Link>
                        <span>/</span>
                        <Link href="/offers" className="hover:text-[var(--brand-royal-red)]">Offers</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{campaign.name}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
                {/* Header with Sort */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                            {campaign.name} Products
                        </h2>
                        <p className="text-sm text-gray-600">
                            {products.length} products
                        </p>
                    </div>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)] appearance-none pr-8 font-medium"
                        >
                            <option value="recommended">Recommended</option>
                            <option value="discount">Highest Discount</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {sortedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {sortedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No products in this campaign.</p>
                        <Link href="/offers" className="text-[var(--brand-royal-red)] font-semibold hover:underline mt-4 inline-block">
                            ← Browse other offers
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
