"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import CategoryTopFilters from "@/components/CategoryTopFilters";
import { getBrandwiseProducts, getTopBrands, filterProductsByAttributes, getCategoriesFromServer, getProductsBySubcategory, getProductsByChildCategory, prefetchCategoryTreeProducts, getCampaigns } from "@/lib/api";

export default function BrandPage() {
    const params = useParams();
    const brandId = params.id;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState("recommended");
    const [mobileSortOpen, setMobileSortOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    // Brand name for display
    const [brandName, setBrandName] = useState("");
    const [brandImage, setBrandImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);

    const [filters, setFilters] = useState({
        categories: [],
        brands: [],
        priceRange: [0, 100000],
        colors: [],
        sizes: [],
        discount: 0,
        attributeValues: [],
    });

    // Subcategory filtering state
    const [brandSubcategories, setBrandSubcategories] = useState([]); // categories with nested sub_category
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
    const [selectedChildCategoryId, setSelectedChildCategoryId] = useState(null);
    const [productCategoryIds, setProductCategoryIds] = useState(new Set()); // category IDs found in brand products

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

    // Fetch brand info
    useEffect(() => {
        const fetchBrandInfo = async () => {
            try {
                const response = await getTopBrands();
                if (response.success && response.data) {
                    const brand = response.data.find(b => b.id == brandId);
                    if (brand) {
                        setBrandName(brand.name);
                        setBrandImage(brand.image_path);
                    }
                }
            } catch (error) {
                console.error("Error fetching brand info:", error);
            }
        };

        if (brandId) {
            fetchBrandInfo();
        }
    }, [brandId]);

    // Fetch full categories tree and cross-reference with brand products
    useEffect(() => {
        if (productCategoryIds.size === 0) return;

        const fetchAndFilterCategories = async () => {
            try {
                const response = await getCategoriesFromServer();
                if (response.success && response.data) {
                    // Filter to only categories whose IDs appear in the brand's products
                    const relevantCategories = response.data
                        .filter(cat => productCategoryIds.has(cat.category_id) || productCategoryIds.has(String(cat.category_id)))
                        .map(cat => ({
                            id: cat.category_id,
                            name: cat.name,
                            sub_category: cat.sub_category || []
                        }))
                        .filter(cat => cat.sub_category.length > 0); // only show those that have subcategories

                    setBrandSubcategories(relevantCategories);
                }
            } catch (error) {
                console.error("Error fetching categories for brand filter:", error);
            }
        };

        fetchAndFilterCategories();
    }, [productCategoryIds]);

    // Background prefetch for brand-relevant subcategory and child-category lists.
    useEffect(() => {
        if (!brandSubcategories.length) return;

        const subcategoryIds = brandSubcategories.flatMap((category) =>
            (category.sub_category || []).map((sub) => sub.id)
        );
        const childCategoryIds = brandSubcategories.flatMap((category) =>
            (category.sub_category || []).flatMap((sub) =>
                (sub.child_categories || []).map((child) => child.id)
            )
        );

        prefetchCategoryTreeProducts({
            subcategoryIds,
            childCategoryIds,
            includeAllPages: true
        }).catch((error) => {
            console.error("Brand prefetch failed:", error);
        });
    }, [brandSubcategories]);

    const buildCampaignDiscountMap = (campaigns = []) => {
        const discountMap = {};
        campaigns.forEach((campaign) => {
            const campaignProducts = Array.isArray(campaign?.products) ? campaign.products : [];
            campaignProducts.forEach((product) => {
                const productId = product?.id;
                const mrp = Number(product?.retails_price || 0);
                if (!productId || mrp <= 0) return;

                const discountType = String(product?.pivot?.discount_type || campaign?.discount_type || "percentage").toLowerCase();
                const discountValue = Number(product?.pivot?.discount ?? campaign?.discount ?? 0);
                if (discountValue <= 0) return;

                const discountedPrice = discountType === "amount"
                    ? Math.max(0, mrp - discountValue)
                    : Math.max(0, Math.round(mrp * (1 - discountValue / 100)));
                const savings = Math.max(0, mrp - discountedPrice);

                const existing = discountMap[productId];
                if (!existing || savings > existing.savings) {
                    discountMap[productId] = {
                        discountType,
                        discountValue,
                        savings,
                    };
                }
            });
        });
        return discountMap;
    };

    const getProductPricing = (product, campaignDiscountsMap = {}) => {
        const mrp = Number(product.retails_price || 0);
        let finalPrice = mrp;
        let discountLabel = "";
        let rawDiscount = Number(product.discount || 0);

        if (rawDiscount > 0) {
            const discountType = product.discount_type ? String(product.discount_type).toLowerCase() : "percentage";
            if (discountType === "amount") {
                finalPrice = mrp - rawDiscount;
                discountLabel = `\u09F3${rawDiscount} OFF`;
            } else {
                finalPrice = Math.round(mrp * (1 - rawDiscount / 100));
                discountLabel = `${rawDiscount}% OFF`;
            }
            if (finalPrice < 0) finalPrice = 0;
        }

        const campaignDiscount = campaignDiscountsMap[product.id];
        if (campaignDiscount && mrp > 0) {
            const campaignFinalPrice = campaignDiscount.discountType === "amount"
                ? Math.max(0, mrp - campaignDiscount.discountValue)
                : Math.max(0, Math.round(mrp * (1 - campaignDiscount.discountValue / 100)));

            if (rawDiscount <= 0 || campaignFinalPrice < finalPrice) {
                finalPrice = campaignFinalPrice;
                rawDiscount = campaignDiscount.discountValue;
                discountLabel = campaignDiscount.discountType === "amount"
                    ? `\u09F3${campaignDiscount.discountValue} OFF`
                    : `${campaignDiscount.discountValue}% OFF`;
            }
        }

        return { mrp, finalPrice, discountLabel, rawDiscount };
    };

    // Handle subcategory selection — fetch subcategory products and filter by brand
    const handleSubcategoryChange = async (subcategoryId) => {
        setSelectedSubcategoryId(subcategoryId);
        setSelectedChildCategoryId(null);
        setPage(1);

        if (!subcategoryId) {
            // Deselected — re-fetch normal brand products
            return; // the main useEffect will re-trigger due to selectedSubcategoryId change
        }

        try {
            setLoading(true);
            const response = await getProductsBySubcategory(subcategoryId, 1);
            let productsArray = [];

            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    productsArray = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    productsArray = response.data.data;
                }
            }

            // Filter by current brand name (case-insensitive)
            const brandLower = (brandName || "").toLowerCase();
            const filteredByBrand = productsArray.filter(p => {
                const pBrand = (p.brand_name || p.brands?.name || "").toLowerCase();
                return pBrand === brandLower;
            });

            let campaignDiscountsMap = {};
            try {
                const campaignsResponse = await getCampaigns();
                if (campaignsResponse?.success && Array.isArray(campaignsResponse?.campaigns?.data)) {
                    const activeCampaigns = campaignsResponse.campaigns.data.filter((campaign) => campaign?.status === "active");
                    campaignDiscountsMap = buildCampaignDiscountMap(activeCampaigns);
                }
            } catch (campaignError) {
                console.error("Error fetching campaigns for brand subcategory discount overlay:", campaignError);
            }

            // Transform
            const transformedProducts = filteredByBrand.map(product => {
                const { mrp, finalPrice, discountLabel, rawDiscount } = getProductPricing(product, campaignDiscountsMap);

                return {
                    id: product.id,
                    brand: product.brand_name || product.brands?.name || brandName || "BRAND",
                    name: product.name,
                    price: `\u09F3 ${finalPrice.toLocaleString()}`,
                    originalPrice: discountLabel ? `\u09F3 ${mrp.toLocaleString()}` : "",
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
                    color: product.color || "gray",
                    colorCode: product.color_code || null,
                    rating: product.review_summary?.average_rating || 0,
                    reviews: product.review_summary?.total_reviews || 0,
                    rawPrice: finalPrice,
                    rawDiscount,
                };
            });

            setProducts(transformedProducts);
            setTotalPages(1); // subcategory filtered results are single-page for now
        } catch (error) {
            console.error("Error fetching subcategory products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChildCategoryChange = async (childCategoryId, parentSubcategoryId) => {
        setSelectedSubcategoryId(parentSubcategoryId || null);
        setSelectedChildCategoryId(childCategoryId);
        setPage(1);

        if (!childCategoryId) {
            if (parentSubcategoryId) {
                await handleSubcategoryChange(parentSubcategoryId);
            }
            return;
        }

        try {
            setLoading(true);
            const response = await getProductsByChildCategory(childCategoryId, 1);
            let productsArray = [];

            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    productsArray = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    productsArray = response.data.data;
                }
            }

            const brandLower = (brandName || "").toLowerCase();
            const filteredByBrand = productsArray.filter(p => {
                const pBrand = (p.brand_name || p.brands?.name || "").toLowerCase();
                return pBrand === brandLower;
            });

            let campaignDiscountsMap = {};
            try {
                const campaignsResponse = await getCampaigns();
                if (campaignsResponse?.success && Array.isArray(campaignsResponse?.campaigns?.data)) {
                    const activeCampaigns = campaignsResponse.campaigns.data.filter((campaign) => campaign?.status === "active");
                    campaignDiscountsMap = buildCampaignDiscountMap(activeCampaigns);
                }
            } catch (campaignError) {
                console.error("Error fetching campaigns for brand child-category discount overlay:", campaignError);
            }

            const transformedProducts = filteredByBrand.map(product => {
                const { mrp, finalPrice, discountLabel, rawDiscount } = getProductPricing(product, campaignDiscountsMap);

                return {
                    id: product.id,
                    brand: product.brand_name || product.brands?.name || brandName || "BRAND",
                    name: product.name,
                    price: `\u09F3 ${finalPrice.toLocaleString()}`,
                    originalPrice: discountLabel ? `\u09F3 ${mrp.toLocaleString()}` : "",
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
                    color: product.color || "gray",
                    colorCode: product.color_code || null,
                    rating: product.review_summary?.average_rating || 0,
                    reviews: product.review_summary?.total_reviews || 0,
                    rawPrice: finalPrice,
                    rawDiscount,
                };
            });

            setProducts(transformedProducts);
            setTotalPages(1);
        } catch (error) {
            console.error("Error fetching child category products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch products (main brand products — skipped when subcategory is selected)
    useEffect(() => {
        if (selectedSubcategoryId || selectedChildCategoryId) return; // dedicated handlers manage filtered fetch

        const fetchProducts = async () => {
            try {
                setLoading(true);
                let productsArray = [];
                let response;

                // If attribute filters are active, use the filter-products API
                if (filters.attributeValues.length > 0) {
                    response = await filterProductsByAttributes(
                        filters.attributeValues,
                        page,
                        { brandId }
                    );
                    if (response.success && response.data?.data) {
                        productsArray = response.data.data;
                    }
                    if (response.pagination) {
                        setTotalPages(response.pagination.last_page);
                    }
                } else {
                    response = await getBrandwiseProducts(brandId, page);

                    if (response.success && response.data) {
                        if (Array.isArray(response.data)) {
                            productsArray = response.data;
                        } else if (response.data.data && Array.isArray(response.data.data)) {
                            productsArray = response.data.data;
                        }

                        // Extract category IDs from products for cross-referencing with categories API
                        if (page === 1 && filters.attributeValues.length === 0) {
                            const catIds = new Set();
                            productsArray.forEach(p => {
                                if (p.category_id) catIds.add(String(p.category_id));
                            });
                            if (catIds.size > 0) {
                                setProductCategoryIds(catIds);
                            }
                        }

                        // Extract banner image from the first product's brands data if available
                        if (productsArray.length > 0 && productsArray[0].brands && productsArray[0].brands.banner_image) {
                            setBannerImage(productsArray[0].brands.banner_image);
                            if (!brandName) {
                                setBrandName(productsArray[0].brands.name);
                            }
                            if (!brandImage && productsArray[0].brands.image_path) {
                                setBrandImage(productsArray[0].brands.image_path);
                            }
                        }

                        if (response.pagination) {
                            setTotalPages(response.pagination.last_page);
                        } else if (response.data?.last_page) {
                            setTotalPages(response.data.last_page);
                        }
                    }
                }

                if (productsArray.length > 0) {
                    let campaignDiscountsMap = {};
                    try {
                        const campaignsResponse = await getCampaigns();
                        if (campaignsResponse?.success && Array.isArray(campaignsResponse?.campaigns?.data)) {
                            const activeCampaigns = campaignsResponse.campaigns.data.filter((campaign) => campaign?.status === "active");
                            campaignDiscountsMap = buildCampaignDiscountMap(activeCampaigns);
                        }
                    } catch (campaignError) {
                        console.error("Error fetching campaigns for brand discount overlay:", campaignError);
                    }

                    const transformedProducts = productsArray.map(product => {
                        const { mrp, finalPrice, discountLabel, rawDiscount } = getProductPricing(product, campaignDiscountsMap);

                        return {
                            id: product.id,
                            brand: product.brand_name || product.brands?.name || brandName || "BRAND",
                            name: product.name,
                            price: `\u09F3 ${finalPrice.toLocaleString()}`,
                            originalPrice: discountLabel ? `\u09F3 ${mrp.toLocaleString()}` : "",
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
                            color: product.color || "gray",
                            colorCode: product.color_code || null,
                            rating: product.review_summary?.average_rating || 0,
                            reviews: product.review_summary?.total_reviews || 0,
                            rawPrice: finalPrice,
                            rawDiscount,
                        };
                    });

                    setProducts(transformedProducts);

                    if (response.pagination) {
                        setTotalPages(response.pagination.last_page);
                    } else if (response.data?.last_page) {
                        setTotalPages(response.data.last_page);
                    }
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        if (brandId) {
            fetchProducts();
        }
    }, [brandId, page, brandName, filters.attributeValues, selectedSubcategoryId, selectedChildCategoryId]);


    // Apply filters and sorting
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

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
            priceRange: [0, 100000],
            colors: [],
            sizes: [],
            discount: 0,
            attributeValues: [],
        });
        setSelectedSubcategoryId(null);
        setSelectedChildCategoryId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-0 md:pt-0">
            {/* Brand Banner */}
            {bannerImage && (
                <div className="w-full h-[200px] md:h-[300px] relative">
                    <img
                        src={bannerImage}
                        alt={brandName}
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
                            <Link href="/" className="hover:text-[var(--brand-royal-red)]">Home</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">{brandName || "Brand"}</span>

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
                                            {[
                                                { value: "recommended", label: "Recommended" },
                                                { value: "newest", label: "Newest First" },
                                                { value: "price-low", label: "Price: Low to High" },
                                                { value: "price-high", label: "Price: High to Low" },
                                            ].map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSortBy(option.value);
                                                        setMobileSortOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 md:py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${sortBy === option.value ? 'text-[var(--brand-royal-red)] font-bold' : 'text-gray-700'}`}
                                                >
                                                    {option.label}
                                                    {sortBy === option.value && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand-royal-red)]">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
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
                    selectedAttributeValues={filters.attributeValues}
                    onAttributeChange={(values) => handleFilterChange('attributeValues', values)}
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
                            hideBrandFilter={true}
                            brandSubcategories={brandSubcategories}
                            selectedSubcategoryId={selectedSubcategoryId}
                            onSubcategoryChange={handleSubcategoryChange}
                            selectedChildCategoryId={selectedChildCategoryId}
                            onChildCategoryChange={handleChildCategoryChange}
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
                                    className="ml-0"
                                    selectedAttributeValues={filters.attributeValues}
                                    onAttributeChange={(values) => handleFilterChange('attributeValues', values)}
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
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg">No products found.</p>
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
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto pb-20">
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
                            hideBrandFilter={true}
                            brandSubcategories={brandSubcategories}
                            selectedSubcategoryId={selectedSubcategoryId}
                            onSubcategoryChange={handleSubcategoryChange}
                            selectedChildCategoryId={selectedChildCategoryId}
                            onChildCategoryChange={handleChildCategoryChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
