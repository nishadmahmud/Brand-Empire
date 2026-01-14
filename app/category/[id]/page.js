"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import CategoryTopFilters from "@/components/CategoryTopFilters";
import { getProducts, getProductsBySubcategory, getProductsByChildCategory, getCategoriesFromServer, getCategoryWiseProducts, filterProductsByAttributes, getAttributes } from "@/lib/api";

export default function CategoryPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const categoryId = params.id;
    const subcategoryId = searchParams.get('subcategory');
    const childId = searchParams.get('child');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState("recommended");
    const [mobileSortOpen, setMobileSortOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    // Breadcrumb data
    const [categoryName, setCategoryName] = useState("");
    const [subcategoryName, setSubcategoryName] = useState("");
    const [currentCategoryData, setCurrentCategoryData] = useState(null);

    const [childName, setChildName] = useState("");
    const [bannerImage, setBannerImage] = useState(null);
    const [attributes, setAttributes] = useState([]); // Dynamic attributes for filters

    const [filters, setFilters] = useState({
        categories: [],
        brands: [],
        priceRange: [0, 10000],
        colors: [],
        sizes: [],
        discount: 0,
        attributeValues: [], // Selected attribute value IDs for top filters
    });

    // Extract unique sizes from products
    const availableSizes = useMemo(() => {
        const sizes = products
            .flatMap(p => p.sizes || [])
            .filter((size, index, self) => self.indexOf(size) === index)
            .sort((a, b) => {
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                }
                return a.localeCompare(b);
            });
        return sizes;
    }, [products]);

    // Pre-select subcategory filter when arriving from navbar with ?subcategory=X
    // REMOVED - navigation should work normally, multi-select is for WITHIN page filtering

    // Close sort dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setMobileSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch attributes for filters
    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const data = await getAttributes();
                // Handle both array response and {success, data} response
                let attrArray = [];
                if (Array.isArray(data)) {
                    attrArray = data;
                } else if (data.success && Array.isArray(data.data)) {
                    attrArray = data.data;
                }
                // Filter only active attributes with active values
                const filtered = attrArray
                    .filter(attr => attr.status === 'active')
                    .map(attr => ({
                        ...attr,
                        values: (attr.values || []).filter(v => v.status === 'active')
                    }))
                    .filter(attr => attr.values.length > 0);
                setAttributes(filtered);
            } catch (error) {
                console.error("Error fetching attributes:", error);
            }
        };
        fetchAttributes();
    }, []);

    // Fetch category names and data for filters
    useEffect(() => {
        const fetchCategoryNames = async () => {
            try {
                const response = await getCategoriesFromServer();
                if (response.success && response.data) {
                    const category = response.data.find(c => c.category_id == categoryId);
                    if (category) {
                        setCategoryName(category.name);
                        setCurrentCategoryData(category);
                        let currentBanner = category.banner;

                        if (subcategoryId && category.sub_category) {
                            const subcat = category.sub_category.find(s => s.id == subcategoryId);
                            if (subcat) {
                                setSubcategoryName(subcat.name);
                                // Update banner from subcategory (singular 'banner' or first item of 'banners' array)
                                if (subcat.banner) {
                                    currentBanner = subcat.banner;
                                } else if (subcat.banners && subcat.banners.length > 0) {
                                    currentBanner = subcat.banners[0];
                                }

                                if (childId && subcat.child_categories) {
                                    const child = subcat.child_categories.find(c => c.id == childId);
                                    if (child) {
                                        setChildName(child.name);
                                        if (child.banner) {
                                            currentBanner = child.banner;
                                        }
                                    }
                                }
                            }
                        }
                        setBannerImage(currentBanner);
                    }
                }
            } catch (error) {
                console.error("Error fetching category names:", error);
            }
        };

        if (categoryId) {
            fetchCategoryNames();
        }
    }, [categoryId, subcategoryId, childId]);

    // Helper function to transform product data
    const transformProduct = (product) => {
        const mrp = product.retails_price || 0;
        let finalPrice = mrp;
        let discountLabel = "";

        if (product.discount > 0) {
            const discountType = product.discount_type ? String(product.discount_type).toLowerCase() : 'percentage';
            if (discountType === 'amount') {
                finalPrice = mrp - product.discount;
                discountLabel = `৳${product.discount} OFF`;
            } else {
                finalPrice = Math.round(mrp * (1 - product.discount / 100));
                discountLabel = `${product.discount}% OFF`;
            }
            if (finalPrice < 0) finalPrice = 0;
        }

        return {
            id: product.id,
            brand: product.brand_name || product.brands?.name || "BRAND",
            name: product.name,
            price: `৳ ${finalPrice.toLocaleString()}`,
            originalPrice: product.discount > 0 ? `৳ ${mrp.toLocaleString()}` : "",
            discount: discountLabel,
            images: product.image_paths && product.image_paths.length > 0
                ? product.image_paths
                : [product.image_path, product.image_path1, product.image_path2].filter(Boolean),
            sizes: product.product_variants && product.product_variants.length > 0
                ? product.product_variants.map(v => v.name)
                : ["S", "M", "L", "XL"],
            unavailableSizes: product.product_variants && product.product_variants.length > 0
                ? product.product_variants.filter(v => v.quantity === 0).map(v => v.name)
                : [],
            color: product.color ||
                (product.name.toLowerCase().includes("black") ? "black" :
                    product.name.toLowerCase().includes("blue") ? "blue" :
                        product.name.toLowerCase().includes("white") ? "white" : "gray"),
            rating: product.review_summary?.average_rating || 0,
            reviews: product.review_summary?.total_reviews || 0,
            rawPrice: finalPrice,
            rawDiscount: product.discount,
            subcategoryId: product.sub_category_id,
            childCategoryId: product.child_category_id,
        };
    };

    // Fetch products based on current level AND selected filters
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let allProducts = [];

                // If attribute filters are selected, use the filter-products API with category_id
                if (filters.attributeValues.length > 0) {
                    const response = await filterProductsByAttributes(filters.attributeValues, page, { categoryId });
                    if (response.success && response.data?.data) {
                        allProducts = response.data.data;
                    }
                    if (response.pagination) {
                        setTotalPages(response.pagination.last_page);
                    }
                }
                // Otherwise use category-based fetching
                else if (subcategoryId) {
                    // We're on a subcategory page
                    if (filters.categories.length > 0) {
                        // Fetch products for each selected child category
                        const fetchPromises = filters.categories.map(childCatId =>
                            getProductsByChildCategory(childCatId, page)
                        );
                        const responses = await Promise.all(fetchPromises);
                        responses.forEach(response => {
                            if (response.success && response.data) {
                                allProducts = [...allProducts, ...response.data];
                            }
                        });
                    } else {
                        // No child categories selected, fetch all for this subcategory
                        const response = await getProductsBySubcategory(subcategoryId, page);
                        if (response.success && response.data) {
                            allProducts = response.data;
                        }
                        if (response.pagination) {
                            setTotalPages(response.pagination.last_page);
                        }
                    }
                } else {
                    // We're on main category page
                    if (filters.categories.length > 0) {
                        // Fetch products for each selected subcategory
                        const fetchPromises = filters.categories.map(subCatId =>
                            getProductsBySubcategory(subCatId, page)
                        );
                        const responses = await Promise.all(fetchPromises);
                        responses.forEach(response => {
                            if (response.success && response.data) {
                                allProducts = [...allProducts, ...response.data];
                            }
                        });
                    } else {
                        // No subcategories selected, fetch all for main category
                        const response = await getCategoryWiseProducts(categoryId, page);
                        if (response.success && response.data) {
                            allProducts = response.data;
                        }
                        if (response.pagination) {
                            setTotalPages(response.pagination.last_page);
                        }
                    }
                }

                // Remove duplicates by product id
                const uniqueProducts = allProducts.filter((product, index, self) =>
                    index === self.findIndex(p => p.id === product.id)
                );

                // Transform products
                const transformedProducts = uniqueProducts.map(transformProduct);
                setProducts(transformedProducts);

            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchProducts();
        }
    }, [categoryId, subcategoryId, page, filters.categories, filters.attributeValues]);

    // Apply filters and sorting (categories already handled by API fetch)
    const filteredAndSortedProducts = React.useMemo(() => {
        let result = [...products];

        // Apply brand filter
        if (filters.brands.length > 0) {
            result = result.filter(p => filters.brands.includes(p.brand));
        }

        // Apply price range filter
        result = result.filter(p =>
            p.rawPrice >= filters.priceRange[0] &&
            p.rawPrice <= filters.priceRange[1]
        );

        // Apply color filter
        if (filters.colors.length > 0) {
            result = result.filter(p => filters.colors.includes(p.color));
        }

        // Apply size filter
        if (filters.sizes.length > 0) {
            result = result.filter(p =>
                p.sizes.some(size => filters.sizes.includes(size))
            );
        }

        // Apply discount filter
        if (filters.discount > 0) {
            result = result.filter(p => p.rawDiscount >= filters.discount);
        }

        // Apply sorting
        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => a.rawPrice - b.rawPrice);
                break;
            case "price-high":
                result.sort((a, b) => b.rawPrice - a.rawPrice);
                break;
            case "newest":
                result.reverse();
                break;
            default:
                break;
        }

        return result;
    }, [products, filters, sortBy]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleClearAll = () => {
        setFilters({
            categories: [],
            brands: [],
            priceRange: [0, 10000],
            colors: [],
            sizes: [],
            discount: 0,
            attributeValues: [],
        });
    };

    const handleSubCategoryChange = (subId) => {
        const params = new URLSearchParams(searchParams);
        if (subId) {
            params.set('subcategory', subId);
        } else {
            params.delete('subcategory');
        }
        params.delete('child'); // Reset child when sub changes
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleChildCategoryChange = (childId) => {
        const params = new URLSearchParams(searchParams);
        if (childId) {
            params.set('child', childId);
        } else {
            params.delete('child');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const subCategories = currentCategoryData?.sub_category || [];
    const childCategories = subcategoryId
        ? currentCategoryData?.sub_category?.find(s => s.id == subcategoryId)?.child_categories || []
        : [];

    return (
        <div className="min-h-screen bg-gray-50 pt-0 md:pt-4">

            {/* Banner */}
            {bannerImage && (
                <div className="w-full h-[200px] md:h-[300px] relative">
                    <img
                        src={bannerImage}
                        alt={categoryName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Breadcrumb - with Filter/Sort on mobile */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2 md:py-3">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb Links */}
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 flex-wrap">
                            <a href="/" className="hover:text-[var(--brand-royal-red)]">Home</a>
                            <span>/</span>
                            {categoryName ? (
                                <>
                                    <a
                                        href={`/category/${categoryId}`}
                                        className={`hover:text-[var(--brand-royal-red)] ${!subcategoryName ? 'text-gray-900 font-medium' : ''}`}
                                    >
                                        {categoryName}
                                    </a>
                                    {subcategoryName && (
                                        <>
                                            <span>/</span>
                                            <a
                                                href={`/category/${categoryId}?subcategory=${subcategoryId}`}
                                                className={`hover:text-[var(--brand-royal-red)] ${!childName ? 'text-gray-900 font-medium' : ''}`}
                                            >
                                                {subcategoryName}
                                            </a>
                                        </>
                                    )}
                                    {childName && (
                                        <>
                                            <span>/</span>
                                            <span className="text-gray-900 font-medium">{childName}</span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-900 font-medium">Products</span>
                            )}
                            {/* Item count on mobile */}
                            <span className="lg:hidden text-gray-400 ml-1">
                                ({loading ? "..." : filteredAndSortedProducts.length})
                            </span>
                        </div>

                        {/* Filter & Sort - Mobile only in breadcrumb */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <button
                                onClick={() => setMobileFiltersOpen(true)}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 bg-white text-xs font-medium transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" y1="21" x2="4" y2="14"></line>
                                    <line x1="4" y1="10" x2="4" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12" y2="3"></line>
                                    <line x1="20" y1="21" x2="20" y2="16"></line>
                                    <line x1="20" y1="12" x2="20" y2="3"></line>
                                </svg>
                                <span>Filter</span>
                            </button>
                            <div className="relative" ref={sortDropdownRef}>
                                <button
                                    onClick={() => setMobileSortOpen(!mobileSortOpen)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                >
                                    <span>
                                        {sortBy === "recommended" ? "Sort" :
                                            sortBy === "newest" ? "New" :
                                                sortBy === "price-low" ? "Low" :
                                                    sortBy === "price-high" ? "High" : "Sort"}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${mobileSortOpen ? 'rotate-180' : ''}`}>
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>

                                {mobileSortOpen && (
                                    <>
                                        <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setMobileSortOpen(false)}></div>
                                        <div className="fixed inset-x-0 bottom-0 z-[101] w-full rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl md:rounded-lg md:absolute md:top-full md:left-0 md:right-auto md:bottom-auto md:w-56 md:mt-2 bg-white border-t md:border border-gray-100 py-2 pb-20 md:pb-2 max-h-[60vh] md:max-h-96 overflow-y-auto">
                                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 md:hidden">
                                                <span className="font-bold text-gray-900">Sort By</span>
                                                <button onClick={() => setMobileSortOpen(false)} className="p-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSortBy("recommended");
                                                    setMobileSortOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 md:py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${sortBy === "recommended" ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'
                                                    }`}
                                            >
                                                Recommended
                                                {sortBy === "recommended" && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand-royal-red)]">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortBy("newest");
                                                    setMobileSortOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 md:py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${sortBy === "newest" ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'
                                                    }`}
                                            >
                                                Newest First
                                                {sortBy === "newest" && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand-royal-red)]">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortBy("price-low");
                                                    setMobileSortOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 md:py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${sortBy === "price-low" ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'
                                                    }`}
                                            >
                                                Price: Low to High
                                                {sortBy === "price-low" && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand-royal-red)]">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortBy("price-high");
                                                    setMobileSortOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 md:py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${sortBy === "price-high" ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'
                                                    }`}
                                            >
                                                Price: High to Low
                                                {sortBy === "price-high" && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand-royal-red)]">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Filters - Mobile */}
            <div className="md:hidden bg-white border-b border-gray-100 px-4">
                <CategoryTopFilters
                    availableSizes={availableSizes}
                    selectedSizes={filters.sizes}
                    onSizeChange={(size) => {
                        const newSizes = filters.sizes.includes(size)
                            ? filters.sizes.filter(s => s !== size)
                            : [...filters.sizes, size];
                        handleFilterChange('sizes', newSizes);
                    }}
                    selectedAttributeValues={filters.attributeValues}
                    onAttributeChange={(values) => handleFilterChange('attributeValues', values)}
                    hiddenAttributeNames={[categoryName, subcategoryName, childName].filter(Boolean)}
                />
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2 md:py-6">

                <div className="flex gap-6">
                    {/* Filter Sidebar - Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearAll={handleClearAll}
                            products={products}
                            categories={subcategoryId ? childCategories : subCategories}
                        />
                    </div>

                    {/* Products Section */}
                    <div className="flex-1">
                        {/* Header with Filters and Sort - Desktop */}
                        <div className="hidden md:flex items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
                            {/* Left: Filters */}
                            <div className="flex-1">
                                <CategoryTopFilters
                                    availableSizes={availableSizes}
                                    selectedSizes={filters.sizes}
                                    onSizeChange={(size) => {
                                        const newSizes = filters.sizes.includes(size)
                                            ? filters.sizes.filter(s => s !== size)
                                            : [...filters.sizes, size];
                                        handleFilterChange('sizes', newSizes);
                                    }}
                                    selectedAttributeValues={filters.attributeValues}
                                    onAttributeChange={(values) => handleFilterChange('attributeValues', values)}
                                    className="ml-0"
                                    hiddenAttributeNames={[categoryName, subcategoryName, childName].filter(Boolean)}
                                />
                            </div>

                            {/* Right: Sort Dropdown */}
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)] appearance-none font-medium pr-8"
                                    >
                                        <option value="recommended">Recommended</option>
                                        <option value="newest">Newest First</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-royal-red)]"></div>
                            </div>
                        ) : filteredAndSortedProducts.length > 0 ? (
                            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
                                {filteredAndSortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} categoryId={categoryId} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                                <button
                                    onClick={handleClearAll}
                                    className="mt-4 text-[var(--brand-royal-red)] font-semibold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-700">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto pb-32">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setMobileFiltersOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearAll={handleClearAll}
                            products={products}
                            categories={subcategoryId ? childCategories : subCategories}
                            attributes={attributes}
                            selectedAttributeValues={filters.attributeValues}
                            onAttributeChange={(values) => handleFilterChange('attributeValues', values)}
                        />
                    </div>
                </div>
            )}
        </div>

    );
}
