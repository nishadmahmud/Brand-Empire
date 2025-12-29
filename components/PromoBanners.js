"use client";

import React from "react";
import Image from "next/image";

const PromoBanners = () => {
    return (
        <section className="section-content py-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Banner 1: The December Edit */}
                <div className="relative h-[500px] w-full group overflow-hidden cursor-pointer rounded-sm">
                    <Image
                        src="https://images.unsplash.com/photo-1507680434567-5739c80be1ac?q=80&w=2000&auto=format&fit=crop" // Man in blazer
                        alt="The December Edit"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute bottom-12 left-10 text-white">
                        <p className="italic font-serif text-2xl mb-1">The</p>
                        <h3 className="text-5xl font-serif mb-2 leading-none uppercase tracking-wide">
                            DECEMBER <br /> <span className="italic font-normal lowercase">Edit</span>
                        </h3>
                        <p className="text-sm tracking-widest uppercase mb-6 opacity-90">Blazers that do all the talking.</p>
                        <button className="bg-white text-black px-8 py-3 font-bold text-xs tracking-widest uppercase hover:bg-[var(--brand-royal-red)] hover:text-white transition-colors">
                            Shop Now
                        </button>
                    </div>
                </div>

                {/* Banner 2: Holiday Gifting */}
                <div className="relative h-[500px] w-full group overflow-hidden cursor-pointer rounded-sm">
                    <Image
                        src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2000&auto=format&fit=crop" // Gift box
                        alt="Holiday Gifting"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    <div className="absolute bottom-12 right-10 text-white text-right">
                        <h3 className="text-5xl font-serif mb-2 leading-none cursor-default">
                            Holiday <span className="font-sans font-bold">Gifting</span>
                        </h3>
                        <p className="text-lg italic font-serif mb-6 opacity-90">Season of Giving Collection</p>
                        <button className="border-2 border-white text-white px-8 py-3 font-bold text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
                            Shop Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoBanners;
