"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import CategoryTopFilters from "@/components/CategoryTopFilters";
import { getProducts, getProductsBySubcategory, getProductsByChildCategory, getCategoriesFromServer, getCategoryWiseProducts } from "@/lib/api";

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

    // Breadcrumb data
    const [categoryName, setCategoryName] = useState("");
    const [subcategoryName, setSubcategoryName] = useState("");
    const [currentCategoryData, setCurrentCategoryData] = useState(null);

    const [childName, setChildName] = useState("");
    const [bannerImage, setBannerImage] = useState(null);

    const [filters, setFilters] = useState({
        categories: [],
        brands: [],
        priceRange: [0, 10000],
        colors: [],
        sizes: [],
        discount: 0,
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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let response;
                if (childId) {
                    response = await getProductsByChildCategory(childId, page);
                } else if (subcategoryId) {
                    response = await getProductsBySubcategory(subcategoryId, page);
                } else {
                    response = await getCategoryWiseProducts(categoryId, page);
                }

                if (response.success && response.data) {
                    // Transform API data to ProductCard format
                    const transformedProducts = response.data.map(product => ({
                        id: product.id,
                        brand: product.brand_name || product.brands?.name || "BRAND",
                        name: product.name,
                        price: `৳ ${product.retails_price.toLocaleString()}`,
                        originalPrice: product.discount > 0
                            ? `৳ ${(product.retails_price / (1 - product.discount / 100)).toFixed(0)}`
                            : "",
                        discount: product.discount > 0 ? `${product.discount}% OFF` : "",
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
                        // Store raw price for filtering
                        rawPrice: product.retails_price,
                        rawDiscount: product.discount,
                    }));

                    setProducts(transformedProducts);

                    // Set pagination info
                    if (response.pagination) {
                        setTotalPages(response.pagination.last_page);
                    }
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchProducts();
        }
    }, [categoryId, subcategoryId, page]);

    // Apply filters and sorting
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
        <div className="min-h-screen bg-gray-50 pt-4 md:pt-4">

            {/* Banner */}
            {bannerImage && (
                <div className="w-full h-[200px] md:h-[300px] relative">
                    <img
                        src={bannerImage}
                        alt={categoryName}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <h1 className="text-4xl font-bold text-white uppercase tracking-wider">{childName || subcategoryName || categoryName}</h1>
                    </div>
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
                                className="flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 bg-white text-xs font-medium"
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
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs focus:outline-none appearance-none font-medium pr-5"
                                >
                                    <option value="recommended">Sort</option>
                                    <option value="newest">New</option>
                                    <option value="price-low">Low</option>
                                    <option value="price-high">High</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none text-gray-500">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                        />
                    </div>

                    {/* Products Section */}
                    <div className="flex-1">
                        {/* Header with Sort - Desktop only */}
                        <div className="hidden md:flex items-center justify-between mb-3 gap-2">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {categoryName || "Products"}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {loading ? "Loading..." : `${filteredAndSortedProducts.length} products`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Sort Dropdown - Desktop */}
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

                        {/* Top Filter Bar (Myntra Style) */}
                        <CategoryTopFilters
                            subCategories={subCategories}
                            childCategories={childCategories}
                            selectedSubId={subcategoryId}
                            selectedChildId={childId}
                            availableSizes={availableSizes}
                            selectedSizes={filters.sizes}
                            onSubChange={handleSubCategoryChange}
                            onChildChange={handleChildCategoryChange}
                            onSizeChange={(size) => {
                                const newSizes = filters.sizes.includes(size)
                                    ? filters.sizes.filter(s => s !== size)
                                    : [...filters.sizes, size];
                                handleFilterChange('sizes', newSizes);
                            }}
                        />

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-royal-red)]"></div>
                            </div>
                        ) : filteredAndSortedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
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
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
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
                        />
                    </div>
                </div>
            )}
        </div>

    );
}
