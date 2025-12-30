"use client";

import React, { useState } from "react";
import Image from "next/image";

const Navbar = ({ marqueeVisible = true }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className={`fixed ${marqueeVisible ? 'top-[36px]' : 'top-0'} left-0 w-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-50 h-16 md:h-20 flex items-center justify-between px-4 md:px-12 font-sans transition-all duration-300`}>
            {/* Logo Section */}
            <div className="flex items-center">
                <div className="relative h-12 md:h-16 w-32 md:w-44">
                    <Image
                        src="/logo.png"
                        alt="Brand Empire Logo"
                        width={180}
                        height={60}
                        className="object-contain h-full w-auto"
                        priority
                        unoptimized
                    />
                </div>
            </div>

            {/* Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-center gap-10 font-bold text-[#282c3f] uppercase text-[14px] tracking-wider h-full">
                <a href="/category/men" className="h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-1">
                    MEN
                </a>
                <a href="/category/women" className="h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-1">
                    WOMEN
                </a>
                <a href="/category/kids" className="h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-1">
                    KIDS
                </a>
                <a href="#" className="h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-1">
                    HOME & LIVING
                </a>
                <a href="#" className="h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-1">
                    BEAUTY
                </a>
                <div className="relative h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-1 group cursor-pointer">
                    <span className="">STUDIO</span>
                    <span className="absolute top-4 -right-3 text-[10px] font-bold text-[var(--brand-royal-red)]">NEW</span>
                </div>
            </div>

            {/* Right Section: Search & Actions */}
            <div className="flex items-center gap-3 md:gap-8">
                {/* Search Bar - Desktop Only */}
                <div className="hidden lg:flex items-center bg-[#f5f5f6] rounded-md px-4 py-3 w-96 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all group">
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

                {/* Icons - Desktop Only */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
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

                {/* Mobile Icons - Search and Bag */}
                <div className="flex md:hidden items-center gap-4">
                    <button className="p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#282c3f]">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <button className="p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#282c3f]">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg lg:hidden border-t border-gray-100">
                    <div className="flex flex-col p-4">
                        <a href="/category/men" className="py-3 px-4 font-bold text-[#282c3f] uppercase text-[14px] tracking-wider hover:bg-gray-50 hover:text-[var(--brand-royal-red)] transition-colors border-b border-gray-100">
                            MEN
                        </a>
                        <a href="/category/women" className="py-3 px-4 font-bold text-[#282c3f] uppercase text-[14px] tracking-wider hover:bg-gray-50 hover:text-[var(--brand-royal-red)] transition-colors border-b border-gray-100">
                            WOMEN
                        </a>
                        <a href="/category/kids" className="py-3 px-4 font-bold text-[#282c3f] uppercase text-[14px] tracking-wider hover:bg-gray-50 hover:text-[var(--brand-royal-red)] transition-colors border-b border-gray-100">
                            KIDS
                        </a>
                        <a href="#" className="py-3 px-4 font-bold text-[#282c3f] uppercase text-[14px] tracking-wider hover:bg-gray-50 hover:text-[var(--brand-royal-red)] transition-colors border-b border-gray-100">
                            HOME & LIVING
                        </a>
                        <a href="#" className="py-3 px-4 font-bold text-[#282c3f] uppercase text-[14px] tracking-wider hover:bg-gray-50 hover:text-[var(--brand-royal-red)] transition-colors border-b border-gray-100">
                            BEAUTY
                        </a>
                        <a href="#" className="py-3 px-4 font-bold text-[#282c3f] uppercase text-[14px] tracking-wider hover:bg-gray-50 hover:text-[var(--brand-royal-red)] transition-colors border-b border-gray-100">
                            STUDIO
                            <span className="ml-2 text-[10px] text-[var(--brand-royal-red)]">NEW</span>
                        </a>
                        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                            <button className="flex-1 py-2 px-4 border border-gray-300 rounded text-sm font-bold hover:bg-gray-50">
                                Profile
                            </button>
                            <button className="flex-1 py-2 px-4 border border-gray-300 rounded text-sm font-bold hover:bg-gray-50">
                                Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;