"use client";

import React, { useState } from "react";
import { filterOptions } from "@/data/categoryData";

const FilterSidebar = ({ filters, onFilterChange, onClearAll }) => {
    const [brandSearch, setBrandSearch] = useState("");
    const [priceRange, setPriceRange] = useState([500, 9000]);

    const filteredBrands = filterOptions.brands.filter(brand =>
        brand.toLowerCase().includes(brandSearch.toLowerCase())
    );

    const handlePriceChange = (e, index) => {
        const newRange = [...priceRange];
        newRange[index] = parseInt(e.target.value);
        setPriceRange(newRange);
        onFilterChange('priceRange', newRange);
    };

    return (
        <div className="w-full bg-white border-r border-gray-200 p-6 overflow-y-auto h-full">
            {/* Header with Clear All */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-wider">Filters</h3>
                <button
                    onClick={onClearAll}
                    className="text-xs text-[var(--brand-royal-red)] font-bold uppercase hover:underline"
                >
                    Clear All
                </button>
            </div>

            {/* Gender Filter */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="space-y-3">
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="radio"
                            name="gender"
                            value="Men"
                            checked={filters.gender === "Men"}
                            onChange={(e) => onFilterChange('gender', e.target.value)}
                            className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 focus:ring-[var(--brand-royal-red)]"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-black">Men</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="radio"
                            name="gender"
                            value="Women"
                            checked={filters.gender === "Women"}
                            onChange={(e) => onFilterChange('gender', e.target.value)}
                            className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 focus:ring-[var(--brand-royal-red)]"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-black">Women</span>
                    </label>
                </div>
            </div>

            {/* Categories */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Categories</h4>
                <div className="space-y-3">
                    {filterOptions.categories.map((category) => (
                        <label key={category} className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.categories.includes(category)}
                                onChange={(e) => {
                                    const newCategories = e.target.checked
                                        ? [...filters.categories, category]
                                        : filters.categories.filter(c => c !== category);
                                    onFilterChange('categories', newCategories);
                                }}
                                className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 rounded focus:ring-[var(--brand-royal-red)]"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-black">{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Brand */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Brand</h4>

                {/* Search Input */}
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[var(--brand-royal-red)]"
                    />
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto">
                    {filteredBrands.map((brand) => (
                        <label key={brand} className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.brands.includes(brand)}
                                onChange={(e) => {
                                    const newBrands = e.target.checked
                                        ? [...filters.brands, brand]
                                        : filters.brands.filter(b => b !== brand);
                                    onFilterChange('brands', newBrands);
                                }}
                                className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 rounded focus:ring-[var(--brand-royal-red)]"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-black">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Price</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">৳{priceRange[0]}</span>
                        <span className="text-sm text-gray-400">-</span>
                        <span className="text-sm text-gray-600">৳{priceRange[1]}</span>
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            min="500"
                            max="9000"
                            step="100"
                            value={priceRange[0]}
                            onChange={(e) => handlePriceChange(e, 0)}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-royal-red)]"
                        />
                        <input
                            type="range"
                            min="500"
                            max="9000"
                            step="100"
                            value={priceRange[1]}
                            onChange={(e) => handlePriceChange(e, 1)}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-royal-red)] mt-2"
                        />
                    </div>
                </div>
            </div>

            {/* Color */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Color</h4>
                <div className="space-y-3">
                    {filterOptions.colors.map((color) => (
                        <label key={color.name} className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.colors.includes(color.name)}
                                onChange={(e) => {
                                    const newColors = e.target.checked
                                        ? [...filters.colors, color.name]
                                        : filters.colors.filter(c => c !== color.name);
                                    onFilterChange('colors', newColors);
                                }}
                                className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 rounded focus:ring-[var(--brand-royal-red)]"
                            />
                            <div className="ml-3 flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color.hex }}
                                ></div>
                                <span className="text-sm text-gray-700 group-hover:text-black">{color.name}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Discount Range */}
            <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Discount Range</h4>
                <div className="space-y-3">
                    {filterOptions.discountRanges.map((range) => (
                        <label key={range.value} className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="discount"
                                value={range.value}
                                checked={filters.discount === range.value}
                                onChange={(e) => onFilterChange('discount', parseInt(e.target.value))}
                                className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 focus:ring-[var(--brand-royal-red)]"
                            />
                            <span className="ml-3 text-sm text-blue-600 group-hover:text-blue-800">{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
