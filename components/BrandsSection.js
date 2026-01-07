"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTopBrands } from "@/lib/api";

const BrandRow = ({ title, brands }) => (
    <div className="mb-12 md:mb-16">
        <h3 className="text-lg md:text-2xl font-bold text-center mb-6 md:mb-10 tracking-[0.1em] md:tracking-[0.2em] text-[#282c3f] uppercase relative inline-block w-full">
            {title}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-1 bg-[var(--brand-royal-red)] rounded-full mt-4 block translate-y-4"></span>
        </h3>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12">
            {brands.map((brand, index) => (
                <Link key={brand.id || index} href={`/brand/${brand.id}`} className="flex flex-col items-center group cursor-pointer">
                    <div className="relative w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-lg border-2 md:border-4 border-transparent group-hover:border-[var(--brand-royal-red)] transition-all duration-300 transform group-hover:scale-105">
                        <Image
                            src={brand.image_path || brand.image}
                            alt={brand.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                        />
                        {/* Dark overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <span className="mt-2 md:mt-4 font-bold text-[#282c3f] tracking-wider md:tracking-widest text-[10px] md:text-sm group-hover:text-[var(--brand-royal-red)] transition-colors uppercase">
                        {brand.name}
                    </span>
                </Link>
            ))}
        </div>
    </div>
);

// Fallback data for when API fails
const fallbackInternationalBrands = [
    { name: "H&M", image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=2000&auto=format&fit=crop" },
    { name: "ZARA", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop" },
    { name: "GUCCI", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2000&auto=format&fit=crop" },
    { name: "NIKE", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop" },
    { name: "LEVI'S", image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=2000&auto=format&fit=crop" },
    { name: "ADIDAS", image: "https://brand.assets.adidas.com/image/upload/f_auto,q_auto:best,fl_lossy/if_w_gt_800,w_800/xcat_fw25_holiday_spezial_tcc_w_d_99f02e71d3.jpg" },
];

const BrandsSection = () => {
    const [internationalBrands, setInternationalBrands] = useState([]);
    const [localBrands, setLocalBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await getTopBrands();
                if (response.success && response.data && response.data.length > 0) {
                    // First 6 brands are International
                    const international = response.data.slice(0, 5);
                    // Remaining brands (after first 6) are Bangladeshi
                    const bangladeshi = response.data.slice(5);

                    setInternationalBrands(international);
                    setLocalBrands(bangladeshi);
                } else {
                    // Use fallback if API fails or returns no data
                    setInternationalBrands(fallbackInternationalBrands);
                }
            } catch (error) {
                console.error("Error fetching brands:", error);
                setInternationalBrands(fallbackInternationalBrands);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    if (loading) {
        return (
            <section className="section-content py-12 md:py-16 overflow-hidden">
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-royal-red)]"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="section-content py-12 md:py-16 overflow-hidden">
            {/* International Brands - Always visible if there are brands */}
            {internationalBrands.length > 0 && (
                <BrandRow title="International Icons" brands={internationalBrands} />
            )}

            {/* Bangladeshi Brands - Only visible if there are more than 6 brands total */}
            {localBrands.length > 0 && (
                <BrandRow title="Bangladeshi Pride" brands={localBrands} />
            )}
        </section>
    );
};

export default BrandsSection;
