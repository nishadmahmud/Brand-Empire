"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { megaMenuData } from "@/data/megaMenuData";
import { useCart } from "@/context/CartContext";
import { getCategoriesFromServer, searchProducts } from "@/lib/api";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "./ProductCard";

const Navbar = ({ marqueeVisible = true, mobileMenuOpen, setMobileMenuOpen }) => {
    const [activeMegaMenu, setActiveMegaMenu] = useState(null);
    const [categories, setCategories] = useState([]);
    const { toggleCart, getCartCount } = useCart();

    const { user, logout } = useAuth();
    const { wishlist } = useWishlist();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);

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
                        sizes: p.items?.map(item => item.size) || [],
                        unavailableSizes: p.items?.filter(item => item.quantity === 0).map(item => item.size) || []
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
        <>
            <nav className={`fixed ${marqueeVisible ? 'top-[36px]' : 'top-0'} left-0 w-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] z-50 h-[60px] md:h-[70px] font-sans transition-all duration-300`}>
                <div className="max-w-[1500px] mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-4">

                    {/* Left Section: Hamburger (Mobile) + Logo */}
                    <div className="flex items-center gap-3 md:gap-0">
                        {/* Mobile Hamburger */}
                        <button
                            className="lg:hidden text-gray-800"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>

                        <Link href="/" className="flex items-center flex-shrink-0">
                            <div className="relative h-8 md:h-12 w-24 md:w-36">
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
                    </div>

                    {/* Navigation Links - Center - Desktop Only */}
                    <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-bold text-[#282c3f] uppercase text-[13px] tracking-wide h-full">
                        {/* Offers Link */}
                        <div
                            className="relative h-full flex items-center border-b-4 border-transparent hover:border-[var(--brand-royal-red)] transition-all px-2"
                            onMouseEnter={() => setActiveMegaMenu('offers')}
                            onMouseLeave={() => setActiveMegaMenu(null)}
                        >
                            <Link href="/offers" className="text-[var(--brand-royal-red)] font-extrabold" onClick={() => setActiveMegaMenu(null)}>
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
                                <Link href={`/category/${category.category_id}`} onClick={() => setActiveMegaMenu(null)}>
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
                                                <ProductCard
                                                    key={product.id}
                                                    product={product}
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        setSearchQuery(""); // Optional: clear search on navigation
                                                    }}
                                                />
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

                        {/* Search Icon - Mobile Only */}
                        <button
                            className="lg:hidden text-gray-700 hover:text-[var(--brand-royal-red)]"
                            onClick={() => setMobileSearchOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>

                        {/* Profile/Login Icon - Desktop Only (Mobile in Sidebar/Bottom) */}
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

                        {/* Wishlist Icon - Visible on Mobile too per user request */}
                        <Link href="/wishlist" className="relative flex flex-col items-center gap-0.5 text-gray-700 hover:text-[var(--brand-royal-red)] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span className="hidden lg:block text-[10px] font-medium">Wishlist</span>
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[var(--brand-royal-red)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

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
                    </div>
                </div>

                {/* Mega Menu Dropdown */}
                {activeMegaMenu && (
                    <div
                        className="hidden lg:block absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-200"
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
                                                <Link href={`/category/${activeMegaMenu}?subcategory=${subCat.id}`} onClick={() => setActiveMegaMenu(null)}>
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
                                                                    onClick={() => setActiveMegaMenu(null)}
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
            </nav>

            {/* Sidebar / Mobile Menu Drawer */}
            {/* Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white z-[70] transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <div className="w-24">
                        <Image
                            src="/logo.png"
                            alt="Brand Empire"
                            width={100}
                            height={30}
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="overflow-y-auto h-[calc(100%-60px)]">

                    {/* User Section */}
                    <div className="p-4 border-b border-gray-100 relative">
                        <div className="absolute top-0 left-0 w-full h-16 bg-[var(--brand-royal-red)] opacity-10 -z-10"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div>
                                {user ? (
                                    <>
                                        <p className="font-bold text-gray-800 text-sm">Welcome Back</p>
                                        <Link href="/profile" className="text-xs text-[var(--brand-royal-red)] font-bold" onClick={() => setMobileMenuOpen(false)}>View Profile</Link>
                                    </>
                                ) : (
                                    <Link href="/login" className="font-bold text-gray-800 text-sm flex flex-col" onClick={() => setMobileMenuOpen(false)}>
                                        <span>Login / Signup</span>
                                        <span className="text-xs text-[var(--brand-royal-red)] font-normal">To access account & orders</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shop By Category */}
                    <div className="py-2">
                        <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Shop By Category</h3>
                        <div className="flex flex-col">
                            <Link
                                href="/offers"
                                className="px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex justify-between items-center"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="text-[var(--brand-royal-red)]">New Arrivals & Offers</span>
                            </Link>

                            {categories.map((category) => (
                                <div key={category.category_id} className="border-b border-gray-50">
                                    <div className="flex items-center">
                                        <Link
                                            href={`/category/${category.category_id}`}
                                            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {category.name}
                                        </Link>
                                        {category.sub_category && category.sub_category.length > 0 && (
                                            <button
                                                onClick={() => setExpandedCategory(expandedCategory === category.category_id ? null : category.category_id)}
                                                className="px-4 py-3 text-gray-400 hover:bg-gray-50"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className={`transition-transform duration-200 ${expandedCategory === category.category_id ? 'rotate-90' : ''}`}
                                                >
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Subcategories Dropdown */}
                                    {expandedCategory === category.category_id && category.sub_category && (
                                        <div className="bg-gray-50 py-2">
                                            {category.sub_category.map((subCat) => (
                                                <div key={subCat.id}>
                                                    <Link
                                                        href={`/category/${category.category_id}?subcategory=${subCat.id}`}
                                                        className="block px-8 py-2 text-sm text-[var(--brand-royal-red)] font-medium hover:bg-gray-100"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        {subCat.name}
                                                    </Link>
                                                    {/* Child categories */}
                                                    {subCat.child_categories && subCat.child_categories.length > 0 && (
                                                        <div className="pl-4">
                                                            {subCat.child_categories.map((child) => (
                                                                <Link
                                                                    key={child.id}
                                                                    href={`/category/${category.category_id}?subcategory=${subCat.id}&child=${child.id}`}
                                                                    className="block px-8 py-1.5 text-xs text-gray-600 hover:text-[var(--brand-royal-red)] hover:bg-gray-100"
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="border-t border-gray-100 py-2">
                        <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Links</h3>
                        <div className="flex flex-col">
                            <Link href="/track-order" className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Track Order</Link>
                            <Link href="/contact" className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
                            <Link href="/faqs" className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>FAQs</Link>
                        </div>
                    </div>

                    {user && (
                        <div className="p-4 mt-4">
                            <button
                                onClick={logout}
                                className="w-full border border-gray-300 rounded text-sm font-bold text-gray-600 py-2 hover:bg-gray-50"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
                <div className="fixed inset-0 bg-white z-[100] flex flex-col lg:hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center gap-2 p-4 border-b border-gray-100 shadow-sm bg-white">
                        <button
                            onClick={() => setMobileSearchOpen(false)}
                            className="p-2 -ml-2 text-gray-600 hover:text-black"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5"></path>
                                <path d="M12 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ml-2 bg-transparent w-full text-base text-gray-900 placeholder-gray-500 focus:outline-none"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 pb-20">
                        {isSearchLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="p-4 grid grid-cols-2 gap-4">
                                {searchResults.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={() => setMobileSearchOpen(false)}
                                    />
                                ))}
                            </div>
                        ) : searchQuery ? (
                            <div className="text-center py-20 text-gray-500 px-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-300">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <p>No products found for "{searchQuery}"</p>
                            </div>
                        ) : (
                            <div className="px-6 py-8 text-center text-gray-400 text-sm">
                                Start typing to search for products
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;