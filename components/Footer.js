"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCategoriesFromServer } from "@/lib/api";

const Footer = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesFromServer();
                if (response.success && response.data) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Error fetching categories for footer:", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <footer className="section-full bg-[#1a1a1a] text-white mt-16 md:mt-20 py-20">
            <div className="section-content py-8 md:py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
                    {/* Brand Column */}
                    <div className="col-span-1">
                        <div className="mb-4">
                            <Image
                                src="/logo.png"
                                alt="Brand Empire"
                                width={120}
                                height={40}
                                unoptimized
                            />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Your ultimate destination for premium fashion. Discover the latest trends and timeless classics.
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[var(--brand-royal-red)] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[var(--brand-royal-red)] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[var(--brand-royal-red)] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[var(--brand-royal-red)] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Shop</h3>
                        <ul className="space-y-2">
                            <li><Link href="/#new-arrivals" className="text-gray-400 hover:text-white text-sm transition-colors">New Arrivals</Link></li>
                            {categories.map((category) => (
                                <li key={category.category_id}>
                                    <Link href={`/category/${category.category_id}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
                            <li><Link href="/shipping" className="text-gray-400 hover:text-white text-sm transition-colors">Shipping Info</Link></li>
                            <li><Link href="/returns" className="text-gray-400 hover:text-white text-sm transition-colors">Returns</Link></li>
                            <li><Link href="/track-order" className="text-gray-400 hover:text-white text-sm transition-colors">Track Order</Link></li>
                            <li><Link href="/size-guide" className="text-gray-400 hover:text-white text-sm transition-colors">Size Guide</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">Sitemap</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t border-gray-800 pt-6 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-gray-400 text-sm font-semibold">We Accept:</span>
                        <div className="flex gap-2">
                            <div className="bg-white rounded px-2 py-1">
                                <span className="text-xs font-bold text-blue-600">VISA</span>
                            </div>
                            <div className="bg-white rounded px-2 py-1">
                                <span className="text-xs font-bold text-orange-600">Mastercard</span>
                            </div>
                            <div className="bg-white rounded px-2 py-1">
                                <span className="text-xs font-bold text-blue-800">Amex</span>
                            </div>
                            <div className="bg-white rounded px-2 py-1">
                                <span className="text-xs font-bold text-pink-600">bKash</span>
                            </div>
                            <div className="bg-white rounded px-2 py-1">
                                <span className="text-xs font-bold text-orange-500">Nagad</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Brand Empire. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
