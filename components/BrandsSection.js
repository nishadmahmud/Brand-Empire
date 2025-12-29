"use client";

import React from "react";
import Image from "next/image";

const internationalBrands = [
    { name: "H&M", image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=2000&auto=format&fit=crop" },
    { name: "ZARA", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop" },
    { name: "GUCCI", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2000&auto=format&fit=crop" },
    { name: "NIKE", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop" },
    { name: "LEVI'S", image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=2000&auto=format&fit=crop" },
    { name: "ADIDAS", image: "https://brand.assets.adidas.com/image/upload/f_auto,q_auto:best,fl_lossy/if_w_gt_800,w_800/xcat_fw25_holiday_spezial_tcc_w_d_99f02e71d3.jpg" },
];

const localBrands = [
    { name: "AARONG", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=2000&auto=format&fit=crop" }, // Ethnic/Craft
    { name: "YELLOW", image: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=2000&auto=format&fit=crop" }, // Contemporary
    { name: "ECSTASY", image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=2000&auto=format&fit=crop" }, // Modern
    { name: "CATS EYE", image: "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?q=80&w=2000&auto=format&fit=crop" }, // Men's formal
    { name: "RICHMAN", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2000&auto=format&fit=crop" }, // Men's luxury
    { name: "SAILOR", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2000&auto=format&fit=crop" },
];

const BrandRow = ({ title, brands }) => (
    <div className="mb-16">
        <h3 className="text-2xl font-bold text-center mb-10 tracking-[0.2em] text-[#282c3f] uppercase relative inline-block w-full">
            {title}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-[var(--brand-royal-red)] rounded-full mt-4 block translate-y-4"></span>
        </h3>
        <div className="flex justify-center flex-wrap gap-12 px-4">
            {brands.map((brand, index) => (
                <div key={index} className="flex flex-col items-center group cursor-pointer">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg border-4 border-transparent group-hover:border-[var(--brand-royal-red)] transition-all duration-300 transform group-hover:scale-105">
                        <Image
                            src={brand.image}
                            alt={brand.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                        />
                        {/* Dark overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <span className="mt-4 font-bold text-[#282c3f] tracking-widest text-sm group-hover:text-[var(--brand-royal-red)] transition-colors">
                        {brand.name}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

const BrandsSection = () => {
    return (
        <section className="section-content py-20 bg-white">
            <BrandRow title="International Icons" brands={internationalBrands} />
            <div className="w-full h-px bg-gray-100 mb-16 mx-auto max-w-4xl" /> {/* Divider */}
            <BrandRow title="Bangladeshi Pride" brands={localBrands} />
        </section>
    );
};

export default BrandsSection;
