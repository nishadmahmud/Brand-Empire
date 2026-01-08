"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { megaMenuData } from "@/data/megaMenuData";
import { useCart } from "@/context/CartContext";
import { getCategoriesFromServer, searchProducts, getProducts, getCategoryWiseProducts, getCampaigns } from "@/lib/api";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "./ProductCard";

const Navbar = ({ marqueeVisible = true, mobileMenuOpen, setMobileMenuOpen }) => {
    const [activeMegaMenu, setActiveMegaMenu] = useState(null);
    const [categories, setCategories] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const { toggleCart, getCartCount } = useCart();

    const { user, logout, openAuthModal } = useAuth();
    const { wishlist } = useWishlist();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const router = useRouter();

    // Handle search submit (Enter key)
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            e.preventDefault();
            setShowDropdown(false);
            setMobileSearchOpen(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

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

        const fetchCampaigns = async () => {
            try {
                const response = await getCampaigns();
                if (response.success && response.campaigns?.data) {
                    const activeCampaigns = response.campaigns.data.filter(
                        campaign => campaign.status === 'active'
                    );
                    setCampaigns(activeCampaigns);
                }
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            }
        };

        fetchCategories();
        fetchCampaigns();
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
                // Check if query matches a category exactly (case-insensitive)
                const matchedCategory = categories.find(
                    cat => cat.name.toLowerCase() === searchQuery.trim().toLowerCase()
                );

                let products = [];
                let res;

                if (matchedCategory) {
                    // Fetch products by category
                    // getCategoryWiseProducts return structure: { success: true, data: [ ...products ] }
                    res = await getCategoryWiseProducts(matchedCategory.category_id);

                    if (res.success && res.data) {
                        products = res.data.map(p => ({
                            ...p,
                            images: p.image_paths && p.image_paths.length > 0 ? p.image_paths : [p.image_path, p.image_path1, p.image_path2, p.image_path3].filter(Boolean),
                            brand: p.brand_name || p.brands?.name || "Brand Empire",
                            price: `৳ ${p.retails_price || p.price || 0}`,
                            originalPrice: p.regular_price > 0 ? `৳ ${p.regular_price}` : null,
                            discount: p.discount > 0 ? `${p.discount}% OFF` : null,
                            sizes: p.product_variants ? p.product_variants.map(v => v.name) : (p.items?.map(item => item.size) || []),
                            unavailableSizes: p.product_variants ? p.product_variants.filter(v => v.quantity === 0).map(v => v.name) : (p.items?.filter(item => item.quantity === 0).map(item => item.size) || [])
                        }));
                    }
                } else {
                    // Default search
                    // searchProducts return structure: { success: true, data: { data: [ ...products ] } }
                    res = await searchProducts(searchQuery);

                    if (res.success && res.data && res.data.data) {
                        products = res.data.data.map(p => ({
                            ...p,
                            images: [p.image_path, p.image_path1, p.image_path2, p.image_path3].filter(Boolean),
                            brand: p.brands?.name || "Brand Empire",
                            price: `৳ ${p.retails_price}`,
                            originalPrice: p.regular_price > 0 ? `৳ ${p.regular_price}` : null,
                            discount: p.discount > 0 ? `${p.discount}% OFF` : null,
                            sizes: p.items?.map(item => item.size) || [],
                            unavailableSizes: p.items?.filter(item => item.quantity === 0).map(item => item.size) || []
                        }));
                    }
                }

                setSearchResults(products);
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
                                onKeyDown={handleSearchSubmit}
                            />

                            {/* Dropdown Results */}
                            {showDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-[800px] bg-white rounded-lg shadow-2xl z-50 overflow-hidden border border-gray-100 max-h-[70vh] flex flex-col">
                                    {isSearchLoading ? (
                                        <div className="flex justify-center items-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="py-2 flex flex-col overflow-y-auto">
                                            {searchResults.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.id}`}
                                                    className="px-4 py-3 hover:bg-gray-50 flex items-center gap-4 group transition-colors border-b border-gray-50 last:border-0"
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        setSearchQuery("");
                                                    }}
                                                >
                                                    {/* Product Image */}
                                                    <div className="w-10 h-10 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                                        <Image
                                                            src={product.images && product.images[0] ? product.images[0] : "/placeholder.png"} // Fallback image needed? Or check if images array is valid
                                                            alt={product.name}
                                                            fill
                                                            sizes="40px"
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-700 group-hover:text-[var(--brand-royal-red)] truncate">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                            {product.category_name || product.brand || "Product"}
                                                        </p>
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-900 whitespace-nowrap">
                                                        {product.price}
                                                    </div>
                                                </Link>
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
                            <button
                                onClick={() => openAuthModal('login')}
                                className="hidden lg:flex flex-col items-center gap-0.5 text-gray-700 hover:text-[var(--brand-royal-red)] transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span className="text-[10px] font-medium">Login</span>
                            </button>
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
                        className="hidden lg:block absolute left-0 top-full bg-white shadow-lg border-t border-gray-200"
                        style={{ 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            width: '900px',
                            maxWidth: '90vw'
                        }}
                        onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
                        onMouseLeave={() => setActiveMegaMenu(null)}
                    >
                        {/* Offers Mega Menu - Dynamic Campaigns */}
                        {activeMegaMenu === 'offers' && (
                            <div className="px-8 py-6">
                                <div className="flex flex-wrap justify-center items-center gap-4">
                                    {campaigns.length > 0 ? (
                                        <>
                                            {campaigns.map((campaign) => (
                                                <Link
                                                    key={campaign.id}
                                                    href={`/offers/${campaign.id}`}
                                                    className="group flex items-center gap-3 px-5 py-3 rounded-lg bg-gray-50 hover:bg-[var(--brand-royal-red)] transition-all"
                                                    onClick={() => setActiveMegaMenu(null)}
                                                >
                                                    <span className="text-2xl">🔥</span>
                                                    <div>
                                                        <span className="block text-sm font-bold text-gray-900 group-hover:text-white transition-colors">
                                                            {campaign.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 group-hover:text-white/80 transition-colors">
                                                            Up to {campaign.discount}% OFF
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))}
                                            <Link
                                                href="/offers"
                                                className="px-5 py-3 text-sm font-bold text-[var(--brand-royal-red)] hover:underline"
                                                onClick={() => setActiveMegaMenu(null)}
                                            >
                                                View All Offers →
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            href="/offers"
                                            className="px-5 py-3 text-sm font-bold text-[var(--brand-royal-red)] hover:underline"
                                            onClick={() => setActiveMegaMenu(null)}
                                        >
                                            View All Offers →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Dynamic Category Mega Menus */}
                        {activeMegaMenu !== 'offers' && (
                            <div className="px-8 py-8">
                                <div className="grid grid-cols-5 gap-6">
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
                                    <button
                                        className="font-bold text-gray-800 text-sm flex flex-col items-start"
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            openAuthModal('login');
                                        }}
                                    >
                                        <span>Login / Signup</span>
                                        <span className="text-xs text-[var(--brand-royal-red)] font-normal text-left">To access account & orders</span>
                                    </button>
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
                                onKeyDown={handleSearchSubmit}
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