"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * Top Filter Bar closer to Myntra's design
 * Handles Subcategory, Child Category, and Size filters
 */
export default function CategoryTopFilters({
    availableSizes = [],
    selectedSizes = [],
    onSizeChange,
    selectedBundle = "single", // 'single' or 'bundle'
    onBundleChange,
    selectedCountry = "all", // 'all' or 'bangladesh'
    onCountryChange,
    className = ""
}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const itemsRef = useRef({});

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && itemsRef.current[openDropdown] && !itemsRef.current[openDropdown].contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <div className={`flex gap-2 md:gap-3 py-2 md:py-0 relative z-30 overflow-x-auto md:overflow-visible scrollbar-hide ${className}`}>

            {/* Bundles Filter */}
            <div className="relative flex-shrink-0" ref={el => itemsRef.current['bundles'] = el}>
                <button
                    onClick={() => toggleDropdown('bundles')}
                    className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border transition-colors whitespace-nowrap ${selectedBundle !== 'single'
                        ? 'bg-[var(--brand-royal-red)] text-white border-[var(--brand-royal-red)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <span>Bundles</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openDropdown === 'bundles' ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {openDropdown === 'bundles' && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setOpenDropdown(null)}></div>
                        <div className="fixed inset-x-0 bottom-0 z-[101] w-full rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl md:rounded-lg md:absolute md:top-full md:left-0 md:right-auto md:bottom-auto md:w-56 md:mt-2 bg-white border-t md:border border-gray-100 py-2 pb-20 md:pb-2">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 md:hidden">
                                <span className="font-bold text-gray-900">Select Type</span>
                                <button onClick={() => setOpenDropdown(null)} className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => {
                                        onBundleChange('single');
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between ${selectedBundle === 'single' ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedBundle === 'single' ? 'border-[var(--brand-royal-red)] bg-[var(--brand-royal-red)] text-white' : 'border-gray-300'}`}>
                                            {selectedBundle === 'single' && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        Single Styles
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        onBundleChange('bundle');
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between ${selectedBundle === 'bundle' ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedBundle === 'bundle' ? 'border-[var(--brand-royal-red)] bg-[var(--brand-royal-red)] text-white' : 'border-gray-300'}`}>
                                            {selectedBundle === 'bundle' && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        Bundles
                                    </div>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Country of Origin Filter */}
            <div className="relative flex-shrink-0" ref={el => itemsRef.current['country'] = el}>
                <button
                    onClick={() => toggleDropdown('country')}
                    className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border transition-colors whitespace-nowrap ${selectedCountry !== 'all'
                        ? 'bg-[var(--brand-royal-red)] text-white border-[var(--brand-royal-red)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <span>Country of Origin</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openDropdown === 'country' ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {openDropdown === 'country' && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setOpenDropdown(null)}></div>
                        <div className="fixed inset-x-0 bottom-0 z-[101] w-full rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl md:rounded-lg md:absolute md:top-full md:left-0 md:right-auto md:bottom-auto md:w-56 md:mt-2 bg-white border-t md:border border-gray-100 py-2 pb-20 md:pb-2">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 md:hidden">
                                <span className="font-bold text-gray-900">Select Country</span>
                                <button onClick={() => setOpenDropdown(null)} className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => {
                                        onCountryChange('all');
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between ${selectedCountry === 'all' ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedCountry === 'all' ? 'border-[var(--brand-royal-red)] bg-[var(--brand-royal-red)] text-white' : 'border-gray-300'}`}>
                                            {selectedCountry === 'all' && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        All Countries
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        onCountryChange('bangladesh');
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between ${selectedCountry === 'bangladesh' ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedCountry === 'bangladesh' ? 'border-[var(--brand-royal-red)] bg-[var(--brand-royal-red)] text-white' : 'border-gray-300'}`}>
                                            {selectedCountry === 'bangladesh' && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                        Bangladesh
                                    </div>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Size Filter - Always visible */}
            <div className="relative flex-shrink-0" ref={el => itemsRef.current['size'] = el}>
                <button
                    onClick={() => toggleDropdown('size')}
                    className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border transition-colors whitespace-nowrap ${selectedSizes.length > 0
                        ? 'bg-gray-100 text-[var(--brand-royal-red)] border-[var(--brand-royal-red)] border-opacity-30'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <span>Size {selectedSizes.length > 0 ? `(${selectedSizes.length})` : ''}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openDropdown === 'size' ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {openDropdown === 'size' && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setOpenDropdown(null)}></div>
                        <div className="fixed inset-x-0 bottom-0 z-[101] w-full rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl md:rounded-lg md:absolute md:top-full md:left-0 md:right-auto md:bottom-auto md:w-[320px] md:mt-2 bg-white border-t md:border border-gray-100 p-3 pb-20 md:pb-3 max-h-[60vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-3 md:hidden border-b border-gray-100 pb-2">
                                <span className="font-bold text-gray-900">Select Sizes</span>
                                <button onClick={() => setOpenDropdown(null)} className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            {availableSizes && availableSizes.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto custom-scrollbar">
                                    {availableSizes.map((size, index) => (
                                        <label key={`size-${index}-${size}`} className={`flex items-center justify-center p-2 border rounded cursor-pointer text-xs font-medium transition-all ${selectedSizes.includes(size)
                                            ? 'bg-[var(--brand-royal-red)] text-white border-[var(--brand-royal-red)]'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedSizes.includes(size)}
                                                onChange={() => onSizeChange(size)}
                                                className="hidden"
                                            />
                                            {size}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-2">No sizes available</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand-royal-red)]">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}
