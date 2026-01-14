"use client";

import React, { useState, useMemo } from "react";

const FilterSidebar = ({
    filters,
    onFilterChange,
    onClearAll,
    products,
    hideBrandFilter = false,
    categories = [],
    selectedCategoryId,
    onCategoryChange,
    // Attribute filter props
    attributes = [],
    selectedAttributeValues = [],
    onAttributeChange
}) => {
    const [brandSearch, setBrandSearch] = useState("");
    const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 10000]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllBrands, setShowAllBrands] = useState(false);

    // Extract unique brands from products
    const availableBrands = useMemo(() => {
        const brands = products
            .map(p => p.brand)
            .filter(Boolean)
            .filter((brand, index, self) => self.indexOf(brand) === index)
            .sort();
        return brands;
    }, [products]);



    // Extract unique colors from products
    const availableColors = useMemo(() => {
        const colors = products
            .map(p => p.color)
            .filter(Boolean)
            .filter((color, index, self) => self.indexOf(color) === index)
            .sort();
        return colors;
    }, [products]);

    // Calculate price range from products
    const productPriceRange = useMemo(() => {
        if (products.length === 0) return { min: 0, max: 10000 };
        const prices = products.map(p => p.rawPrice || 0);
        return {
            min: Math.floor(Math.min(...prices) / 100) * 100,
            max: Math.ceil(Math.max(...prices) / 100) * 100
        };
    }, [products]);

    const filteredBrands = availableBrands.filter(brand =>
        brand.toLowerCase().includes(brandSearch.toLowerCase())
    );

    const handlePriceChange = (e, index) => {
        const newRange = [...priceRange];
        newRange[index] = parseInt(e.target.value);
        setPriceRange(newRange);
        onFilterChange('priceRange', newRange);
    };

    const discountRanges = [
        { value: 0, label: "All" },
        { value: 10, label: "10% and above" },
        { value: 20, label: "20% and above" },
        { value: 30, label: "30% and above" },
        { value: 40, label: "40% and above" },
        { value: 50, label: "50% and above" },
    ];

    const visibleCategories = showAllCategories ? categories : categories.slice(0, 5);
    const visibleBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 5);

    return (
        <div className="w-full bg-white border-r border-gray-200 p-6 pb-20 h-full">
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

            {/* Categories - Dynamic List */}
            {categories && categories.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Categories</h4>
                    <div className="space-y-3">
                        {visibleCategories.map((category, index) => {
                            // Support both filters.categories array (multi-select) and selectedCategoryId (single-select)
                            const categoryId = category.id || category.category_id;
                            const isChecked = filters?.categories?.includes(categoryId) || selectedCategoryId == categoryId;

                            return (
                                <label key={`${categoryId}-${index}`} className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                            if (onCategoryChange) {
                                                // Single select mode
                                                onCategoryChange(categoryId === selectedCategoryId ? null : categoryId);
                                            } else if (onFilterChange) {
                                                // Multi-select mode via filters
                                                const currentCategories = filters?.categories || [];
                                                const newCategories = currentCategories.includes(categoryId)
                                                    ? currentCategories.filter(id => id !== categoryId)
                                                    : [...currentCategories, categoryId];
                                                onFilterChange('categories', newCategories);
                                            }
                                        }}
                                        className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 rounded focus:ring-[var(--brand-royal-red)]"
                                    />
                                    <span className="ml-3 text-sm text-gray-700 group-hover:text-black">
                                        {category.name}
                                        {typeof category.products_count === 'number' && (
                                            <span className="text-gray-400 ml-1">({category.products_count})</span>
                                        )}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                    {categories.length > 5 && (
                        <button
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="text-sm text-[var(--brand-royal-red)] mt-3 hover:underline font-medium"
                        >
                            {showAllCategories ? "Show Less" : `+ ${categories.length - 5} more`}
                        </button>
                    )}
                </div>
            )}

            {/* Brand - Hidden on brand pages */}
            {!hideBrandFilter && availableBrands.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Brand</h4>

                    {/* Search Input */}
                    {availableBrands.length > 5 && (
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Search brands..."
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[var(--brand-royal-red)]"
                            />
                        </div>
                    )}

                    <div className="space-y-3">
                        {visibleBrands.map((brand, index) => (
                            <label key={`${brand}-${index}`} className="flex items-center cursor-pointer group">
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
                    {filteredBrands.length > 5 && (
                        <button
                            onClick={() => setShowAllBrands(!showAllBrands)}
                            className="text-sm text-[var(--brand-royal-red)] mt-3 hover:underline font-medium"
                        >
                            {showAllBrands ? "Show Less" : `+ ${filteredBrands.length - 5} more`}
                        </button>
                    )}
                </div>
            )}

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
                            min={productPriceRange.min}
                            max={productPriceRange.max}
                            step="100"
                            value={priceRange[0]}
                            onChange={(e) => handlePriceChange(e, 0)}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-royal-red)]"
                        />
                        <input
                            type="range"
                            min={productPriceRange.min}
                            max={productPriceRange.max}
                            step="100"
                            value={priceRange[1]}
                            onChange={(e) => handlePriceChange(e, 1)}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-royal-red)] mt-2"
                        />
                    </div>
                </div>
            </div>



            {/* Color */}
            {availableColors.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Color</h4>
                    <div className="space-y-3">
                        {availableColors.map((color) => (
                            <label key={color} className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.colors.includes(color)}
                                    onChange={(e) => {
                                        const newColors = e.target.checked
                                            ? [...filters.colors, color]
                                            : filters.colors.filter(c => c !== color);
                                        onFilterChange('colors', newColors);
                                    }}
                                    className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 rounded focus:ring-[var(--brand-royal-red)]"
                                />
                                <div className="ml-3 flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-sm text-gray-700 group-hover:text-black capitalize">{color}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Dynamic Attribute Filters - Hidden on mobile since shown in top bar */}
            {attributes && attributes.length > 0 && attributes.map((attribute) => (
                <div key={attribute.id} className="hidden lg:block mb-6 pb-6 border-b border-gray-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-4">{attribute.name}</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                        {attribute.values?.map((value) => {
                            const isSelected = selectedAttributeValues.includes(value.id);
                            return (
                                <label key={value.id} className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {
                                            if (onAttributeChange) {
                                                const newValues = isSelected
                                                    ? selectedAttributeValues.filter(id => id !== value.id)
                                                    : [...selectedAttributeValues, value.id];
                                                onAttributeChange(newValues);
                                            }
                                        }}
                                        className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 rounded focus:ring-[var(--brand-royal-red)]"
                                    />
                                    <span className="ml-3 text-sm text-gray-700 group-hover:text-black">
                                        {value.value}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Discount Range */}
            <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Discount Range</h4>
                <div className="space-y-3">
                    {discountRanges.map((range) => (
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
