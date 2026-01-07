"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * Top Filter Bar closer to Myntra's design
 * Handles Subcategory, Child Category, and Size filters
 */
export default function CategoryTopFilters({
    subCategories = [],
    childCategories = [],
    selectedSubId,
    selectedChildId,
    availableSizes = [],
    selectedSizes = [],
    onSubChange,
    onChildChange,
    onSizeChange
}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <div className="flex flex-wrap gap-3 py-4 border-b border-gray-100 mb-6 relative z-30" ref={dropdownRef}>

            {/* Subcategory Filter - Always visible */}
            <div className="relative">
                <button
                    onClick={() => toggleDropdown('subcategory')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedSubId
                        ? 'bg-[var(--brand-royal-red)] text-white border-[var(--brand-royal-red)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <span>Subcategory</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openDropdown === 'subcategory' ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {openDropdown === 'subcategory' && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                        <button
                            onClick={() => {
                                onSubChange(null);
                                setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${!selectedSubId ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'
                                }`}
                        >
                            All Subcategories
                            {!selectedSubId && <CheckIcon />}
                        </button>
                        {subCategories && subCategories.length > 0 ? (
                            subCategories.map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => {
                                        onSubChange(sub.id);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedSubId == sub.id ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'
                                        }`}
                                >
                                    {sub.name}
                                    {selectedSubId == sub.id && <CheckIcon />}
                                </button>
                            ))
                        ) : (
                            <p className="px-4 py-2 text-sm text-gray-400">No subcategories available</p>
                        )}
                    </div>
                )}
            </div>

            {/* Child Category Filter - Always visible */}
            <div className="relative">
                <button
                    onClick={() => toggleDropdown('child')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedChildId
                        ? 'bg-[var(--brand-royal-red)] text-white border-[var(--brand-royal-red)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <span>Child Category</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openDropdown === 'child' ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {openDropdown === 'child' && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                        <button
                            onClick={() => {
                                onChildChange(null);
                                setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${!selectedChildId ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'
                                }`}
                        >
                            All Child Categories
                            {!selectedChildId && <CheckIcon />}
                        </button>
                        {childCategories && childCategories.length > 0 ? (
                            childCategories.map(child => (
                                <button
                                    key={child.id}
                                    onClick={() => {
                                        onChildChange(child.id);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedChildId == child.id ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'
                                        }`}
                                >
                                    {child.name}
                                    {selectedChildId == child.id && <CheckIcon />}
                                </button>
                            ))
                        ) : (
                            <p className="px-4 py-2 text-sm text-gray-400">No child categories available</p>
                        )}
                    </div>
                )}
            </div>

            {/* Size Filter - Always visible */}
            <div className="relative">
                <button
                    onClick={() => toggleDropdown('size')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedSizes.length > 0
                        ? 'bg-gray-100 text-[var(--brand-royal-red)] border-[var(--brand-royal-red)] border-opacity-30'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <span>Size {selectedSizes.length > 0 ? `(${selectedSizes.length})` : ''}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openDropdown === 'size' ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {openDropdown === 'size' && (
                    <div className="absolute top-full left-0 mt-2 w-[320px] bg-white rounded-lg shadow-xl border border-gray-100 p-3 z-50">
                        {availableSizes && availableSizes.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto custom-scrollbar">
                                {availableSizes.map(size => (
                                    <label key={size} className={`flex items-center justify-center p-2 border rounded cursor-pointer text-xs font-medium transition-all ${selectedSizes.includes(size)
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
