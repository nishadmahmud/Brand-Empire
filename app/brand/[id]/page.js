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
    const [localPage, setLocalPage] = useState(1);
    const [apiTotalPages, setApiTotalPages] = useState(1);
    const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState("recommended");
    const [mobileSortOpen, setMobileSortOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    // Brand info
    const [brandName, setBrandName] = useState("");
    const [brandImage, setBrandImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);

    const [filters, setFilters] = useState({
        categories: [],
        brands: [],
        priceRange: [0, 1000000],
        colors: [],
        sizes: [],
        discount: 0,
        attributeValues: [],
    });

    const [brandSubcategories, setBrandSubcategories] = useState([]);
    const [productCategoryIds, setProductCategoryIds] = useState(new Set());
    const areBrandCategoriesLockedRef = useRef(false);
    const childCategoryIdSet = useMemo(() => {
        const ids = new Set();
        (brandSubcategories || []).forEach((category) => {
            (category.sub_category || []).forEach((sub) => {
                (sub.child_categories || []).forEach((child) => ids.add(String(child.id)));
            });
        });
        return ids;
    }, [brandSubcategories]);

    const buildValidCategoryIdSet = (items) => {
        return new Set(
            items
                .map((p) => p.categoryId)
                .filter((id) => id !== null && id !== undefined && id !== "" && !Number.isNaN(Number(id)))
                .map((id) => String(id))
        );
    };

    const setBrandCategoryIdsOnce = (items) => {
        if (areBrandCategoriesLockedRef.current) return;
        const categoryIds = buildValidCategoryIdSet(items);
        if (categoryIds.size > 0) {
            setProductCategoryIds(categoryIds);
            areBrandCategoriesLockedRef.current = true;
        }
    };

    useEffect(() => {
        // Brand changed: unlock and rebuild categories once for the new brand.
        areBrandCategoriesLockedRef.current = false;
        setProductCategoryIds(new Set());
        setBrandSubcategories([]);
    }, [brandId]);

    const availableSizes = useMemo(() => {
        const sizes = products
            .flatMap(p => p.sizes || [])
            .filter((size, index, self) => self.indexOf(size) === index)
            .sort((a, b) => {
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                return a.localeCompare(b);
            });
        return sizes;
    }, [products]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setMobileSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        if (brandId) fetchBrandInfo();
    }, [brandId]);

    useEffect(() => {
        if (productCategoryIds.size === 0) return;
        const fetchAndFilterCategories = async () => {
            try {
                const response = await getCategoriesFromServer();
                if (response.success && response.data) {
                    const relevantCategories = response.data
                        .filter(cat => productCategoryIds.has(String(cat.category_id)))
                        .map(cat => ({
                            id: cat.category_id,
                            name: cat.name,
                            sub_category: cat.sub_category || []
                        }))
                        .filter(cat => cat.sub_category.length > 0);
                    setBrandSubcategories(relevantCategories);
                }
            } catch (error) {
                console.error("Error fetching categories for brand filter:", error);
            }
        };
        fetchAndFilterCategories();
    }, [productCategoryIds]);

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
                const discountedPrice = discountType === "amount" ? Math.max(0, mrp - discountValue) : Math.max(0, Math.round(mrp * (1 - discountValue / 100)));
                const savings = Math.max(0, mrp - discountedPrice);
                const existing = discountMap[productId];
                if (!existing || savings > existing.savings) {
                    discountMap[productId] = { discountType, discountValue, savings };
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
                discountLabel = `৳${rawDiscount} OFF`;
            } else {
                finalPrice = Math.round(mrp * (1 - rawDiscount / 100));
                discountLabel = `${rawDiscount}% OFF`;
            }
            if (finalPrice < 0) finalPrice = 0;
        }
        const campaignDiscount = campaignDiscountsMap[product.id];
        if (campaignDiscount && mrp > 0) {
            const campaignFinalPrice = campaignDiscount.discountType === "amount" ? Math.max(0, mrp - campaignDiscount.discountValue) : Math.max(0, Math.round(mrp * (1 - campaignDiscount.discountValue / 100)));
            if (rawDiscount <= 0 || campaignFinalPrice < finalPrice) {
                finalPrice = campaignFinalPrice;
                rawDiscount = campaignDiscount.discountValue;
                discountLabel = campaignDiscount.discountType === "amount" ? `৳${campaignDiscount.discountValue} OFF` : `${campaignDiscount.discountValue}% OFF`;
            }
        }
        return { mrp, finalPrice, discountLabel, rawDiscount };
    };

    const transformProduct = (product, campaignDiscountsMap = {}, currentBrandName) => {
        const { mrp, finalPrice, discountLabel, rawDiscount } = getProductPricing(product, campaignDiscountsMap);
        return {
            id: product.id,
            brand: product.brand_name || product.brands?.name || currentBrandName || "BRAND",
            name: product.name,
            price: `৳ ${finalPrice.toLocaleString()}`,
            originalPrice: discountLabel ? `৳ ${mrp.toLocaleString()}` : "",
            discount: discountLabel,
            images: product.image_paths && product.image_paths.length > 0 ? product.image_paths : [product.image_path, product.image_path1, product.image_path2].filter(Boolean),
            sizes: product.product_variants && product.product_variants.length > 0 ? product.product_variants.map(v => v.name) : ["S", "M", "L", "XL"],
            unavailableSizes: product.product_variants && product.product_variants.length > 0 ? product.product_variants.filter(v => v.quantity === 0).map(v => v.name) : [],
            color: product.color || "gray",
            colorCode: product.color_code || null,
            rating: product.review_summary?.average_rating || 0,
            reviews: product.review_summary?.total_reviews || 0,
            rawPrice: finalPrice,
            rawDiscount,
            categoryId: product.category_id ?? product.categoryId ?? null,
            subcategoryId: product.sub_category_id ?? product.subcategory_id ?? product.sub_category?.id ?? product.subcategory?.id ?? null,
            childCategoryId: product.child_category_id ?? product.childcategory_id ?? product.child_category?.id ?? product.childCategory?.id ?? null
        };
    };

    // Main background fetcher
    useEffect(() => {
        const fetchAllBrandProducts = async () => {
            try {
                setLoading(true);
                let campaignMap = {};
                try {
                    const campaignsRes = await getCampaigns();
                    if (campaignsRes?.success && Array.isArray(campaignsRes?.campaigns?.data)) {
                        campaignMap = buildCampaignDiscountMap(campaignsRes.campaigns.data.filter(c => c.status === "active"));
                    }
                } catch (e) { console.error(e); }

                const selectedCategoryIds = filters.categories.map(String);
                const isSameBrandProduct = (p) => {
                    const apiBrandId = p.brand_id ?? p.brands?.id ?? p.brand?.id ?? null;
                    if (apiBrandId != null && String(apiBrandId) === String(brandId)) return true;
                    const apiBrandName = String(p.brand_name || p.brands?.name || p.brand?.name || "").toLowerCase();
                    const expectedBrandName = String(brandName || "").toLowerCase();
                    return expectedBrandName ? apiBrandName === expectedBrandName : false;
                };

                // Category selection should fetch by selected sub/child category, then keep only this brand.
                if (selectedCategoryIds.length > 0) {
                    const uniqueById = (items) =>
                        items.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));

                    // Show first page quickly for selected sub/child categories.
                    const selectedTargets = [];
                    let firstPageMerged = [];
                    for (const selectedId of selectedCategoryIds) {
                        const fetchFn = childCategoryIdSet.has(String(selectedId)) ? getProductsByChildCategory : getProductsBySubcategory;
                        const firstRes = await fetchFn(selectedId, 1);
                        if (!firstRes?.success || !firstRes?.data) continue;

                        const firstItems = Array.isArray(firstRes.data) ? firstRes.data : (firstRes.data.data || []);
                        const firstPageBrandItems = firstItems.filter(isSameBrandProduct).map((p) => transformProduct(p, campaignMap, brandName));
                        firstPageMerged = [...firstPageMerged, ...firstPageBrandItems];

                        selectedTargets.push({
                            id: selectedId,
                            fetchFn,
                            lastPage: firstRes.pagination?.last_page || 1,
                        });
                    }

                    const firstPageUnique = uniqueById(firstPageMerged);
                    setProducts(firstPageUnique);
                    setBrandCategoryIdsOnce(firstPageUnique);
                    setApiTotalPages(1);
                    setLoading(false);

                    // Then fetch remaining pages in background and append.
                    setIsBackgroundLoading(true);
                    for (const target of selectedTargets) {
                        for (let p = 2; p <= target.lastPage; p++) {
                            const pageRes = await target.fetchFn(target.id, p);
                            if (!pageRes?.success || !pageRes?.data) continue;

                            const pageItems = Array.isArray(pageRes.data) ? pageRes.data : (pageRes.data.data || []);
                            const pageBrandItems = pageItems
                                .filter(isSameBrandProduct)
                                .map((item) => transformProduct(item, campaignMap, brandName));
                            if (pageBrandItems.length === 0) continue;

                            setProducts((prev) => uniqueById([...prev, ...pageBrandItems]));
                        }
                    }
                    setIsBackgroundLoading(false);
                    return;
                }

                // 1. Fetch First Page
                let response;
                if (filters.attributeValues.length > 0) {
                    response = await filterProductsByAttributes(filters.attributeValues, 1, { brandId });
                } else {
                    response = await getBrandwiseProducts(brandId, 1);
                }

                if (response?.success && response?.data) {
                    const dataBatch = Array.isArray(response.data) ? response.data : (response.data.data || []);
                    if (response.pagination) setApiTotalPages(response.pagination.last_page);

                    // Setup Banner/Brand Name from first batch
                    if (dataBatch.length > 0 && dataBatch[0].brands) {
                        const b = dataBatch[0].brands;
                        if (b.banner_image) setBannerImage(b.banner_image);
                        if (!brandName && b.name) setBrandName(b.name);
                    }

                    const initialTransformed = dataBatch.map(p => transformProduct(p, campaignMap, brandName));
                    setProducts(initialTransformed);
                    
                    // Update Category IDs for Sidebar
                    setBrandCategoryIdsOnce(initialTransformed);

                    setLoading(false);

                    // 2. Background Fetch rest
                    setIsBackgroundLoading(true);
                    if (filters.attributeValues.length > 0) {
                        let mergedTransformed = [...initialTransformed];
                        const lastPage = response.pagination?.last_page || 1;
                        for (let p = 2; p <= lastPage; p++) {
                            const res = await filterProductsByAttributes(filters.attributeValues, p, { brandId });
                            if (res?.success && res?.data) {
                                const newItems = Array.isArray(res.data) ? res.data : (res.data.data || []);
                                const transformed = newItems.map(item => transformProduct(item, campaignMap, brandName));
                                mergedTransformed = [...mergedTransformed, ...transformed];
                            }
                        }
                        const unique = mergedTransformed.filter((item, index, self) =>
                            index === self.findIndex((t) => t.id === item.id)
                        );
                        setProducts(unique);
                        setBrandCategoryIdsOnce(unique);
                    } else {
                        // Brand endpoint can have multiple pages even when pagination metadata is absent.
                        // Keep fetching until a page returns fewer than 20 items.
                        let mergedTransformed = [...initialTransformed];
                        let p = 2;
                        const pageLimit = 20;
                        const maxSafetyPages = 200;
                        while (p <= maxSafetyPages) {
                            const res = await getBrandwiseProducts(brandId, p, pageLimit);
                            if (!res?.success || !res?.data) break;
                            const newItems = Array.isArray(res.data) ? res.data : (res.data.data || []);
                            if (newItems.length === 0) break;

                            const transformed = newItems.map(item => transformProduct(item, campaignMap, brandName));
                            mergedTransformed = [...mergedTransformed, ...transformed];

                            if (newItems.length < pageLimit) break;
                            p += 1;
                        }
                        const unique = mergedTransformed.filter((item, index, self) =>
                            index === self.findIndex((t) => t.id === item.id)
                        );
                        setProducts(unique);
                        setBrandCategoryIdsOnce(unique);
                    }
                    setIsBackgroundLoading(false);
                } else {
                    setProducts([]);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Brand fetch error:", error);
                setLoading(false);
            }
        };

        if (brandId) {
            setLocalPage(1);
            fetchAllBrandProducts();
        }
    }, [brandId, brandName, filters.attributeValues, filters.categories, childCategoryIdSet]);

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];
        const hasAnyCategoryIds = result.some((p) =>
            p.categoryId != null || p.subcategoryId != null || p.childCategoryId != null
        );

        if (filters.categories.length > 0 && hasAnyCategoryIds) {
            const selectedCategoryIds = filters.categories.map(String);
            result = result.filter((p) =>
                selectedCategoryIds.includes(String(p.categoryId)) ||
                selectedCategoryIds.includes(String(p.subcategoryId)) ||
                selectedCategoryIds.includes(String(p.childCategoryId))
            );
        }
        result = result.filter(p => p.rawPrice >= filters.priceRange[0] && p.rawPrice <= filters.priceRange[1]);
        if (filters.colors.length > 0) result = result.filter(p => filters.colors.includes(p.color));
        if (filters.sizes.length > 0) result = result.filter(p => p.sizes.some(size => filters.sizes.includes(size)));
        if (filters.discount > 0) result = result.filter(p => p.rawDiscount >= filters.discount);
        
        switch (sortBy) {
            case "price-low": result.sort((a, b) => a.rawPrice - b.rawPrice); break;
            case "price-high": result.sort((a, b) => b.rawPrice - a.rawPrice); break;
            case "newest": result.reverse(); break;
        }
        return result;
    }, [products, filters, sortBy]);

    const paginatedProducts = useMemo(() => {
        const start = (localPage - 1) * 20;
        return filteredAndSortedProducts.slice(start, start + 20);
    }, [filteredAndSortedProducts, localPage]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAndSortedProducts.length / 20)), [filteredAndSortedProducts]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setLocalPage(1);
    };

    const handleClearAll = () => {
        setFilters({ categories: [], brands: [], priceRange: [0, 1000000], colors: [], sizes: [], discount: 0, attributeValues: [] });
        setLocalPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {bannerImage && (
                <div className="w-full h-[200px] md:h-[300px] relative">
                    <img src={bannerImage} alt={brandName} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2 md:py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 flex-wrap">
                            <Link href="/" className="hover:text-[var(--brand-royal-red)]">Home</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">{brandName || "Brand"}</span>
                            <span className="text-gray-400 ml-1">- {loading ? "..." : filteredAndSortedProducts.length} items</span>
                        </div>
                        <div className="flex items-center gap-2 lg:hidden">
                            <button onClick={() => setMobileFiltersOpen(true)} className="px-3 py-1.5 border border-gray-200 rounded-full bg-white text-xs font-medium">Filter</button>
                            <button onClick={() => setMobileSortOpen(!mobileSortOpen)} className="px-3 py-1.5 border border-gray-200 rounded-full bg-white text-xs font-medium">Sort</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2 md:py-6">
                <div className="flex gap-6">
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearAll={handleClearAll}
                            products={products}
                            hideBrandFilter={true}
                            brandSubcategories={brandSubcategories}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="hidden md:flex items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
                            <div className="flex-1">
                                <CategoryTopFilters
                                    availableSizes={availableSizes}
                                    selectedSizes={filters.sizes}
                                    onSizeChange={(size) => {
                                        const newSizes = filters.sizes.includes(size) ? filters.sizes.filter(s => s !== size) : [...filters.sizes, size];
                                        handleFilterChange('sizes', newSizes);
                                    }}
                                    selectedAttributeValues={filters.attributeValues}
                                    onAttributeChange={(values) => handleFilterChange('attributeValues', values)}
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm">
                                    <option value="recommended">Recommended</option>
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-royal-red)]"></div>
                            </div>
                        ) : paginatedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
                                {paginatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <p className="text-lg">No products found.</p>
                                <button onClick={handleClearAll} className="mt-4 text-[var(--brand-royal-red)] font-semibold hover:underline">Clear all filters</button>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12">
                                <button
                                    onClick={() => { setLocalPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0 }); }}
                                    disabled={localPage === 1}
                                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <div className="flex flex-col items-center">
                                    <span className="text-gray-700 font-medium">Page {localPage} of {totalPages}</span>
                                    {isBackgroundLoading && <span className="text-[10px] text-[var(--brand-royal-red)] animate-pulse uppercase font-bold">Loading more...</span>}
                                </div>
                                <button
                                    onClick={() => { setLocalPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0 }); }}
                                    disabled={localPage === totalPages}
                                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto pb-20">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setMobileFiltersOpen(false)}>X</button>
                        </div>
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearAll={handleClearAll}
                            products={products}
                            hideBrandFilter={true}
                            brandSubcategories={brandSubcategories}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
