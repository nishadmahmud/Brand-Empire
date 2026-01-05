"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { megaMenuData } from "@/data/megaMenuData";
import { useCart } from "@/context/CartContext";
import { getCategoriesFromServer, searchProducts } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "./ProductCard";

const Navbar = ({ marqueeVisible = true }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMegaMenu, setActiveMegaMenu] = useState(null);
    const [categories, setCategories] = useState([]);
    const { toggleCart, getCartCount } = useCart();
    const { user, logout } = useAuth();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesFromServer();
                if (response.success && response.data) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    // Debounced Search
    useEffect(() => {
        const fetchSearch = async () => {
            if (searchQuery.trim().length === 0) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setIsSearchLoading(true);
            setShowDropdown(true);

            try {
                const res = await searchProducts(searchQuery);
                if (res.success && res.data && res.data.data) {
                    const products = res.data.data.map(p => ({
                        ...p,
                        images: [p.image_path, p.image_path1, p.image_path2, p.image_path3].filter(Boolean),
                        brand: p.brands?.name || "Brand Empire",
                        price: `৳ ${p.retails_price}`,
                        originalPrice: p.regular_price > 0 ? `৳ ${p.regular_price}` : null,
                        discount: p.discount > 0 ? `${p.discount}% OFF` : null,
                        sizes: [] // Search API doesn't return sizes yet
                    }));
                    setSearchResults(products);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearchLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSearch, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className={`fixed ${marqueeVisible ? 'top-[36px]' : 'top-0'} left-0 w-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] z-50 h-16 md:h-[70px] font-sans transition-all duration-300`}>
            <div className="max-w-[1500px] mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-8">
                {/* Logo Section - Left */}
                <Link href="/" className="flex items-center flex-shrink-0">
                    <div className="relative h-10 md:h-12 w-28 md:w-36">
                        <Image
                            src="/logo.png"
                            alt="Brand Empire Logo"
                            width={150}
                            height={50}
                            className="object-contain h-full w-auto"
                            priority
                            unoptimized
                        />
                    </div>
                </Link>

                {/* Navigation Links - Center - Desktop Only */}
                <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-bold text-[#282c3f] uppercase text-[13px] tracking-wide h-full">
                    {/* Offers Link */}
                    <div
                        className="relative h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-2"
                        onMouseEnter={() => setActiveMegaMenu('offers')}
                        onMouseLeave={() => setActiveMegaMenu(null)}
                    >
                        <Link href="/offers" className="text-[var(--brand-royal-red)] font-extrabold">
                            OFFERS
                        </Link>
                    </div>

                    {/* Dynamic Categories from API */}
                    {categories.map((category) => (
                        <div
                            key={category.category_id}
                            className="relative h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-2"
                            onMouseEnter={() => setActiveMegaMenu(category.category_id)}
                            onMouseLeave={() => setActiveMegaMenu(null)}
                        >
                            <Link href={`/category/${category.category_id}`}>
                                {category.name.toUpperCase()}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Right Section - Search & Icons */}
                <div className="flex items-center gap-4 xl:gap-6 flex-shrink-0">
                    {/* Search Bar - Desktop Only */}
                    <div ref={searchContainerRef} className="hidden lg:flex items-center bg-gray-50 rounded-md px-4 py-2 w-64 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search for products, brands and more"
                            className="ml-2 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* Dropdown Results */}
                        {showDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-[800px] bg-white rounded-lg shadow-2xl z-50 overflow-hidden border border-gray-100 max-h-[70vh] flex flex-col">
                                {isSearchLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto">
                                        {searchResults.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p className="text-lg">No products found for "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile/Login Icon - Desktop Only */}
                    {user ? (
                        <Link href="/profile" className="hidden lg:flex flex-col items-center gap-0.5 text-gray-700 hover:text-[var(--brand-royal-red)] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className="text-[10px] font-medium">Profile</span>
                        </Link>
                    ) : (
                        <Link href="/login" className="hidden lg:flex flex-col items-center gap-0.5 text-gray-700 hover:text-[var(--brand-royal-red)] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className="text-[10px] font-medium">Login</span>
                        </Link>
                    )}

                    {/* Wishlist Icon - Desktop Only */}
                    <button className="hidden lg:flex flex-col items-center gap-0.5 text-gray-700 hover:text-[var(--brand-royal-red)] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span className="text-[10px] font-medium">Wishlist</span>
                    </button>

                    {/* Bag Icon - Always Visible */}
                    <button
                        onClick={toggleCart}
                        className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[var(--brand-royal-red)] transition-colors relative"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span className="hidden lg:block text-[10px] font-medium">Bag</span>
                        {getCartCount() > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[var(--brand-royal-red)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {getCartCount()}
                            </span>
                        )}
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden text-gray-700"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mega Menu Dropdown */}
            {activeMegaMenu && (
                <div
                    className="absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-200"
                    onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                >
                    {/* Offers Mega Menu (Static for now) */}
                    {activeMegaMenu === 'offers' && megaMenuData['offers'] && (
                        <div className="max-w-[1400px] mx-auto px-8 py-8">
                            <div className="flex justify-center items-center gap-12">
                                {megaMenuData['offers']?.categories[0]?.items.map((brand, index) => (
                                    <Link
                                        key={index}
                                        href={`/offers?brand=${brand.toLowerCase()}`}
                                        className="group flex flex-col items-center gap-2 px-6 py-4 rounded-lg hover:bg-gray-50 transition-all"
                                    >
                                        <div className="w-24 h-24 flex items-center justify-center bg-white rounded-lg shadow-md group-hover:shadow-xl transition-all p-3">
                                            <Image
                                                src={`/brands/${brand.toLowerCase().replace(/[&']/g, "")}.png`}
                                                alt={`${brand} logo`}
                                                width={80}
                                                height={80}
                                                className="object-contain w-full h-full"
                                                unoptimized
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 group-hover:text-[var(--brand-royal-red)] transition-colors">
                                            {brand}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dynamic Category Mega Menus */}
                    {activeMegaMenu !== 'offers' && (
                        <div className="max-w-[1400px] mx-auto px-8 py-8">
                            <div className="grid grid-cols-5 gap-8">
                                {categories.find(c => c.category_id === activeMegaMenu)?.sub_category?.length > 0 ? (
                                    categories.find(c => c.category_id === activeMegaMenu)?.sub_category.map((subCat) => (
                                        <div key={subCat.id}>
                                            <Link href={`/category/${activeMegaMenu}?subcategory=${subCat.id}`}>
                                                <h3 className="font-bold text-[var(--brand-royal-red)] mb-4 text-sm uppercase tracking-wider hover:underline">
                                                    {subCat.name}
                                                </h3>
                                            </Link>
                                            <ul className="space-y-2">
                                                {subCat.child_categories && subCat.child_categories.length > 0 ? (
                                                    subCat.child_categories.map((child) => (
                                                        <li key={child.id}>
                                                            <Link
                                                                href={`/category/${activeMegaMenu}?subcategory=${subCat.id}&child=${child.id}`}
                                                                className="text-sm text-gray-600 hover:text-[var(--brand-royal-red)] transition-colors"
                                                            >
                                                                {child.name}
                                                            </Link>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-sm text-gray-400 italic">No items</li>
                                                )}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-5 text-center text-gray-500 py-8">
                                        No sub-categories found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg lg:hidden">
                    <div className="flex flex-col p-4 space-y-4">
                        <Link href="/offers" className="font-bold text-[var(--brand-royal-red)] uppercase">
                            OFFERS
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.category_id}
                                href={`/category/${category.category_id}`}
                                className="font-bold text-gray-700 uppercase hover:text-[var(--brand-royal-red)]"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}


        </nav>
    );
};

export default Navbar;