"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { getNewArrivalsFromServer } from "@/lib/api";

// Dummy products as fallback
const dummyProducts = [
    {
        id: 101,
        brand: "JACKETS",
        name: "Men Black Solid Casual Jacket",
        price: "৳ 4,999",
        originalPrice: "",
        discount: "",
        images: [
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["M", "L", "XL", "XXL"],
        unavailableSizes: [],
        color: "black",
    },
    {
        id: 102,
        brand: "JACKETS",
        name: "Men Off White Solid Casual Jacket",
        price: "৳ 4,999",
        originalPrice: "",
        discount: "",
        images: [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["S", "M", "L", "XL"],
        unavailableSizes: ["S"],
        color: "beige",
    },
    {
        id: 103,
        brand: "REGULAR STRAIGHT FIT JEANS",
        name: "Men Blue Mid Wash Jeans",
        price: "৳ 2,135",
        originalPrice: "৳ 2,399",
        discount: "11% OFF",
        images: [
            "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["30", "32", "34", "36"],
        unavailableSizes: [],
        color: "blue",
    },
    {
        id: 104,
        brand: "FORMAL TROUSERS",
        name: "Men Brown Solid Formal Trousers",
        price: "৳ 2,499",
        originalPrice: "",
        discount: "",
        images: [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["30", "32", "34", "36"],
        unavailableSizes: [],
        color: "brown",
    },
];

const NewArrivals = () => {
    const [products, setProducts] = useState(dummyProducts); // Start with dummy data
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const response = await getNewArrivalsFromServer();

                if (response.success && response.data && response.data.data && response.data.data.length > 0) {
                    // Transform API data to match ProductCard structure
                    const apiProducts = response.data.data.map(product => {
                        const mrp = product.retails_price || 0;
                        let finalPrice = mrp;
                        let discountLabel = "";

                        if (product.discount > 0) {
                            const discountType = product.discount_type ? String(product.discount_type).toLowerCase() : 'percentage';
                            if (discountType === 'amount') {
                                finalPrice = mrp - product.discount;
                                discountLabel = `৳${product.discount} OFF`;
                            } else {
                                finalPrice = Math.round(mrp * (1 - product.discount / 100));
                                discountLabel = `${product.discount}% OFF`;
                            }
                            if (finalPrice < 0) finalPrice = 0;
                        }

                        return {
                            id: product.id,
                            brand: product.brands?.name || product.category_name || "BRAND",
                            name: product.name,
                            price: `৳ ${finalPrice.toLocaleString()}`,
                            originalPrice: product.discount > 0 ? `৳ ${mrp.toLocaleString()}` : "",
                            discount: discountLabel,
                            images: product.image_paths && product.image_paths.length > 0
                                ? product.image_paths
                                : [product.image_path, product.image_path1, product.image_path2].filter(Boolean),
                            sizes: product.items && product.items.length > 0
                                ? product.items.map(item => item.size)
                                : ["S", "M", "L", "XL"], // Default sizes if no variants
                            unavailableSizes: product.items && product.items.length > 0
                                ? product.items.filter(item => item.quantity === 0).map(item => item.size)
                                : [],
                            color: product.name.toLowerCase().includes("black") ? "black" :
                                product.name.toLowerCase().includes("blue") ? "blue" :
                                    product.name.toLowerCase().includes("white") ? "white" : "default",
                            rating: product.review_summary?.average_rating || 0,
                            reviews: product.review_summary?.total_reviews || 0,
                        };
                    });

                    setProducts(apiProducts);
                }
            } catch (error) {
                console.error("Error fetching new arrivals:", error);
                // Keep dummy products on error
            } finally {
                setLoading(false);
            }
        };

        fetchNewArrivals();
    }, []);

    return (
        <section className="py-12 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        NEW ARRIVALS
                    </h2>
                    <button className="text-sm font-semibold text-[var(--brand-royal-red)] hover:underline uppercase tracking-wide">
                        View All →
                    </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
