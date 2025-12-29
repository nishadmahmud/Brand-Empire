"use client";

import React from "react";
import ProductCard from "./ProductCard";

const newArrivals = [
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
        sizes: ["30", "32", "34", "36", "38"],
        unavailableSizes: ["38"],
        color: "brown",
    },
    {
        id: 105,
        brand: "FORMAL SHIRTS",
        name: "Men Beige Slim Fit Full Sleeves Formal",
        price: "৳ 1,399",
        originalPrice: "",
        discount: "",
        images: [
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["39", "40", "42", "44"],
        unavailableSizes: ["44"],
        color: "beige",
    },
    {
        id: 106,
        brand: "CASUAL SHIRTS",
        name: "Men Black Regular Fit Full Sleeves Shirt",
        price: "৳ 1,599",
        originalPrice: "৳ 1,999",
        discount: "20% OFF",
        images: [
            "https://images.unsplash.com/photo-1626497764746-6dc36546b388?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop",
        ],
        sizes: ["S", "M", "L", "XL"],
        unavailableSizes: [],
        color: "black",
    },
];

const NewArrivals = () => {
    const scrollContainerRef = React.useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 320; // Approx card width + gap
            if (direction === "left") {
                current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    return (
        <section className="section-content py-16 border-t border-gray-100 group relative">
            <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900">
                    New Arrivals
                </h2>
            </div>

            <div className="relative">
                {/* Scroll Button Left */}
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-0 top-[40%] -translate-y-1/2 -translate-x-5 z-20 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-full p-3 text-gray-800 hover:text-[var(--brand-royal-red)] hover:scale-110 transition-all border border-gray-100"
                    aria-label="Scroll Left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>

                {/* Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar scroll-smooth snap-x snap-mandatory px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {newArrivals.map((product) => (
                        <div key={product.id} className="min-w-[280px] md:min-w-[300px] snap-start">
                            <ProductCard product={product} tag="JUST IN" />
                        </div>
                    ))}
                </div>

                {/* Scroll Button Right */}
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-0 top-[40%] -translate-y-1/2 translate-x-5 z-20 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-full p-3 text-gray-800 hover:text-[var(--brand-royal-red)] hover:scale-110 transition-all border border-gray-100"
                    aria-label="Scroll Right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>

                <div className="text-center mt-8">
                    <button className="text-sm font-bold border-b-2 border-black pb-1 hover:text-[var(--brand-royal-red)] hover:border-[var(--brand-royal-red)] transition-colors uppercase tracking-widest">
                        View All New Arrivals
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
