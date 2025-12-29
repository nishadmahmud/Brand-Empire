"use client";

import React from "react";
import Image from "next/image";

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-50 h-20 flex items-center justify-between px-12 min-w-[1200px] font-sans">
            {/* Logo Section */}
            <div className="flex items-center">
                <div className="relative h-16 w-44">
                    <Image
                        src="/logo.png"
                        alt="Brand Empire Logo"
                        width={180}
                        height={60}
                        className="object-contain h-full w-auto"
                        priority
                    />
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-10 font-bold text-[#282c3f] uppercase text-[14px] tracking-wider h-full">
                {['MEN', 'WOMEN', 'KIDS', 'HOME & LIVING', 'BEAUTY'].map((item) => (
                    <a key={item} href="#" className="h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-1">
                        {item}
                    </a>
                ))}
                <div className="relative h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-1 group cursor-pointer">
                    <span className="">STUDIO</span>
                    <span className="absolute top-4 -right-3 text-[10px] font-bold text-[var(--brand-royal-red)]">NEW</span>
                </div>
            </div>

            {/* Right Section: Search & Actions */}
            <div className="flex items-center gap-8">
                {/* Search Bar */}
                <div className="flex items-center bg-[#f5f5f6] rounded-md px-4 py-3 w-96 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3 group-focus-within:text-gray-600">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for products, brands and more"
                        className="bg-transparent border-none outline-none text-[14px] w-full text-gray-700 placeholder-gray-400 font-normal"
                    />
                </div>

                {/* Icons */}
                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#282c3f] group-hover:text-black">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="text-[12px] font-bold text-black">Profile</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#282c3f] group-hover:text-black">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span className="text-[12px] font-bold text-black">Wishlist</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#282c3f] group-hover:text-black">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span className="text-[12px] font-bold text-black">Bag</span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
