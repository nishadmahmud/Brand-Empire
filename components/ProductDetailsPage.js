"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import { dummyProduct, similarProducts, customersAlsoLiked } from "@/data/productData";
import { searchLocation } from "@/data/deliveryData";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { getProductById, getRelatedProduct, getProducts, getCategoriesFromServer, saveProductReview, getProductReviews } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SizeChartModal from "./SizeChartModal";
import WriteReviewModal from "./WriteReviewModal";
// We trust dangerouslySetInnerHTML for now as requested, but we could add purification if package available
// import DOMPurify from 'isomorphic-dompurify'; 
// For now relying on React's dangerouslySetInnerHTML as per plan, user asked for isomorphic-dompurify so I will add it if I can import it.
// The user request code snippet didn't actually import it, but the text said "use a library like isomorphic-dompurify".
// I'll add the import.
import DOMPurify from 'isomorphic-dompurify';

const ProductDetailsPage = ({ productId }) => {
    const searchParams = useSearchParams();
    const categoryIdFromUrl = searchParams.get('category');
    const subcategoryIdFromUrl = searchParams.get('subcategory');
    const childIdFromUrl = searchParams.get('child');

    // Breadcrumb state
    const [categoryName, setCategoryName] = useState("");
    const [subcategoryName, setSubcategoryName] = useState("");
    const [childName, setChildName] = useState("");

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [pincode, setPincode] = useState("");
    const [showOffers, setShowOffers] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [sizeError, setSizeError] = useState(false);
    const [product, setProduct] = useState(dummyProduct); // Start with dummy data
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const [categoryProducts, setCategoryProducts] = useState([]);

    const { user, openAuthModal } = useAuth();
    const router = useRouter();

    // Delivery autocomplete states
    const [deliveryQuery, setDeliveryQuery] = useState("");
    const [deliveryResults, setDeliveryResults] = useState([]);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false);

    // Cart functionality
    const { addToCart, setIsCartOpen } = useCart();

    const { toggleWishlist, isInWishlist } = useWishlist();
    const { showToast } = useToast();

    // Fetch category names for breadcrumb
    useEffect(() => {
        const fetchCategoryNames = async () => {
            if (!categoryIdFromUrl) return;

            try {
                const response = await getCategoriesFromServer();
                if (response.success && response.data) {
                    const category = response.data.find(c => c.category_id == categoryIdFromUrl);
                    if (category) {
                        setCategoryName(category.name);

                        if (subcategoryIdFromUrl && category.sub_category) {
                            const subcat = category.sub_category.find(s => s.id == subcategoryIdFromUrl);
                            if (subcat) {
                                setSubcategoryName(subcat.name);

                                if (childIdFromUrl && subcat.child_categories) {
                                    const child = subcat.child_categories.find(c => c.id == childIdFromUrl);
                                    if (child) {
                                        setChildName(child.name);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching category names:", error);
            }
        };

        fetchCategoryNames();
    }, [categoryIdFromUrl, subcategoryIdFromUrl, childIdFromUrl]);

    // Fetch product data from API
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;

            try {
                // Fetch product details
                const data = await getProductById(productId);

                // Fetch product reviews (New addition)
                let reviewsData = { summary: null, data: [] };
                try {
                    const reviewsRes = await getProductReviews(productId);
                    if (reviewsRes.success) {
                        reviewsData = reviewsRes;
                    }
                } catch (reviewErr) {
                    console.error("Error fetching reviews:", reviewErr);
                }

                if (data.success && data.data) {
                    const apiProduct = data.data;

                    // Transform API data to match our component's expected structure
                    // Merging review data
                    const transformedProduct = {
                        id: apiProduct.id,
                        name: apiProduct.name,
                        price: apiProduct.retails_price,
                        mrp: apiProduct.discount > 0
                            ? Math.round(apiProduct.retails_price / (1 - apiProduct.discount / 100))
                            : apiProduct.retails_price,
                        discount: apiProduct.discount || 0,
                        rating: reviewsData.summary?.average_rating || apiProduct.rating || 0,
                        reviewCount: reviewsData.summary?.total_reviews || 0,
                        brand: apiProduct.brand?.name || apiProduct.brand_name || "Unknown Brand",
                        images: (Array.isArray(apiProduct.image_paths) && apiProduct.image_paths.length > 0
                            ? apiProduct.image_paths
                            : Array.isArray(apiProduct.images) && apiProduct.images.length > 0
                                ? apiProduct.images
                                : apiProduct.gallery ? JSON.parse(apiProduct.gallery) : [apiProduct.image])
                            .filter(img => typeof img === 'string' && img.trim() !== ""),
                        sizes: apiProduct.product_variants ? apiProduct.product_variants.map(v => v.name).filter(Boolean) : [],
                        unavailableSizes: apiProduct.product_variants
                            ? apiProduct.product_variants.filter(v => v.quantity === 0).map(v => v.name)
                            : [],
                        description: apiProduct.description,
                        details: {
                            fit: apiProduct.specifications?.find(s => s.name === "Fit")?.description || "Regular Fit",
                            sizeWornByModel: "M",
                            modelStats: {
                                chest: "38",
                                height: "6'0\""
                            }
                        },
                        materialCare: {
                            material: "Cotton", // Placeholder
                            wash: "Machine Wash"
                        },
                        specifications: {
                            sleeveLength: "Short Sleeves",
                            neck: "Round Neck",
                            fit: "Regular Fit",
                            printOrPatternType: "Solid"
                        },
                        offers: [ // Static offers for now or fetch if available
                            {
                                code: "BRAND20",
                                title: "Get 20% off on your first order",
                                discount: "20% Off"
                            }
                        ],
                        reviews: reviewsData.data || [], // Use fetched reviews
                        ratings: reviewsData.summary?.rating_counts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } // Use fetched rating counts
                    };

                    setProduct(transformedProduct);

                    // Fetch related products
                    // ... (existing logic)
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                // Fallback to dummy? Or show error
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);



    // Fetch related products
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!productId) return;

            try {
                const response = await getRelatedProduct(productId);

                if (response.success && response.data && response.data.length > 0) {
                    // Transform related products to ProductCard format
                    const transformedRelated = response.data
                        .filter(item => item.id != productId)
                        .map(item => ({
                            id: item.id,
                            brand: item.brand_name || item.brands?.name || "BRAND",
                            name: item.name,
                            price: `৳ ${item.retails_price.toLocaleString()}`,
                            originalPrice: item.discount > 0
                                ? `৳ ${(item.retails_price / (1 - item.discount / 100)).toFixed(0)}`
                                : "",
                            discount: item.discount > 0 ? `${item.discount}% OFF` : "",
                            images: (Array.isArray(item.image_paths) && item.image_paths.length > 0
                                ? item.image_paths
                                : [item.image_path, item.image_path1, item.image_path2])
                                .filter(img => typeof img === 'string' && img.trim() !== ''),
                            sizes: item.product_variants && item.product_variants.length > 0
                                ? item.product_variants.map(v => v.name)
                                : ["S", "M", "L", "XL"],
                            unavailableSizes: item.product_variants && item.product_variants.length > 0
                                ? item.product_variants.filter(v => v.quantity === 0).map(v => v.name)
                                : [],
                            color: item.color ||
                                (item.name.toLowerCase().includes("black") ? "black" :
                                    item.name.toLowerCase().includes("blue") ? "blue" :
                                        item.name.toLowerCase().includes("white") ? "white" : "gray"),
                            rating: item.review_summary?.average_rating || 0,
                            reviews: item.review_summary?.total_reviews || 0,
                        }));

                    setRelatedProducts(transformedRelated);
                }
            } catch (error) {
                console.error("Error fetching related products:", error);
                setRelatedProducts([]);
            }
        };

        fetchRelatedProducts();
    }, [productId]);

    // Fetch products from the same category for "Customers Also Liked"
    useEffect(() => {
        const fetchCategoryProducts = async () => {
            // Use category from URL first, fallback to product's category
            const categoryToUse = categoryIdFromUrl || product.categoryId;

            if (!categoryToUse) return;

            try {
                const response = await getProducts(1, categoryToUse);

                if (response.success && response.data && response.data.length > 0) {
                    // Transform and filter out the current product
                    const transformedCategory = response.data
                        .filter(item => item.id != productId) // Exclude current product (loose equality for string/number)
                        .slice(0, 4) // Limit to 4 products
                        .map(item => ({
                            id: item.id,
                            brand: item.brand_name || item.brands?.name || "BRAND",
                            name: item.name,
                            price: `৳ ${item.retails_price.toLocaleString()}`,
                            originalPrice: item.discount > 0
                                ? `৳ ${(item.retails_price / (1 - item.discount / 100)).toFixed(0)}`
                                : "",
                            discount: item.discount > 0 ? `${item.discount}% OFF` : "",
                            images: (Array.isArray(item.image_paths) && item.image_paths.length > 0
                                ? item.image_paths
                                : [item.image_path, item.image_path1, item.image_path2])
                                .filter(img => typeof img === 'string' && img.trim() !== ''),
                            sizes: item.product_variants && item.product_variants.length > 0
                                ? item.product_variants.map(v => v.name)
                                : ["S", "M", "L", "XL"],
                            unavailableSizes: item.product_variants && item.product_variants.length > 0
                                ? item.product_variants.filter(v => v.quantity === 0).map(v => v.name)
                                : [],
                            color: item.color ||
                                (item.name.toLowerCase().includes("black") ? "black" :
                                    item.name.toLowerCase().includes("blue") ? "blue" :
                                        item.name.toLowerCase().includes("white") ? "white" : "gray"),
                            rating: item.review_summary?.average_rating || 0,
                            reviews: item.review_summary?.total_reviews || 0,
                        }))
                        .filter(item => item.images && item.images.length > 0); // Only include products with valid images

                    setCategoryProducts(transformedCategory);
                }
            } catch (error) {
                console.error("Error fetching category products:", error);
                setCategoryProducts([]);
            }
        };

        fetchCategoryProducts();
    }, [categoryIdFromUrl, productId]); // Fixed: Removed product.categoryId to keep array size consistent

    // Handle Add to Bag
    const handleAddToBag = () => {
        if (!selectedSize) {
            setSizeError(true);
            // Scroll to size selector
            document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setSizeError(false);
        addToCart(product, 1, selectedSize);
        showToast(product); // Show toast notification
    };

    const handleOrderNow = () => {
        if (!selectedSize) {
            setSizeError(true);
            // Scroll to size selector
            document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setSizeError(false);
        addToCart(product, 1, selectedSize);
        router.push('/checkout');
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showLightbox) return;

            if (e.key === 'Escape') {
                setShowLightbox(false);
            } else if (e.key === 'ArrowLeft') {
                setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
            } else if (e.key === 'ArrowRight') {
                setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showLightbox, product.images.length]);


    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (showLightbox) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showLightbox]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--brand-royal-red)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="w-[90%] max-w-[1600px] mx-auto py-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                    <a href="/" className="hover:text-black">Home</a>
                    {categoryName && (
                        <>
                            <span>/</span>
                            <a href={`/category/${categoryIdFromUrl}`} className="hover:text-black">
                                {categoryName}
                            </a>
                        </>
                    )}
                    {subcategoryName && (
                        <>
                            <span>/</span>
                            <a href={`/category/${categoryIdFromUrl}?subcategory=${subcategoryIdFromUrl}`} className="hover:text-black">
                                {subcategoryName}
                            </a>
                        </>
                    )}
                    {childName && (
                        <>
                            <span>/</span>
                            <a href={`/category/${categoryIdFromUrl}?subcategory=${subcategoryIdFromUrl}&child=${childIdFromUrl}`} className="hover:text-black">
                                {childName}
                            </a>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-black font-medium truncate max-w-[200px]">{product.name}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-[90%] max-w-[1600px] mx-auto py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Image Gallery */}
                    {/* Left: Image Gallery - 2 Column Grid */}
                    {/* Mobile Image Slider (Horizontal Scroll) */}
                    <div className="relative md:hidden w-full h-[500px]">
                        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full"
                            onScroll={(e) => {
                                const scrollLeft = e.currentTarget.scrollLeft;
                                const width = e.currentTarget.offsetWidth;
                                const index = Math.round(scrollLeft / width);
                                setSelectedImage(index);
                            }}
                        >
                            {product.images.map((img, index) => (
                                <div
                                    key={index}
                                    className="w-full h-full flex-shrink-0 snap-center relative bg-gray-100"
                                    onClick={() => {
                                        setSelectedImage(index);
                                        setShowLightbox(true);
                                    }}
                                    onContextMenu={(e) => e.preventDefault()} // Disable right-click
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} view ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        draggable={false} // Disable drag
                                    />
                                </div>
                            ))}
                        </div>
                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                            {product.images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all ${selectedImage === index ? 'bg-[var(--brand-royal-red)] w-4' : 'bg-gray-300'
                                        }`}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Image Gallery - 2 Column Grid */}
                    <div className="hidden md:grid grid-cols-2 gap-0.5 h-fit">
                        {product.images.map((img, index) => (
                            <div
                                key={index}
                                className="relative w-full h-[500px] bg-gray-100 cursor-zoom-in overflow-hidden group"
                                onClick={() => {
                                    setSelectedImage(index);
                                    setShowLightbox(true);
                                }}
                                onContextMenu={(e) => e.preventDefault()} // Disable right-click
                            >
                                <Image
                                    src={img}
                                    alt={`${product.name} view ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    unoptimized
                                    draggable={false} // Disable drag
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right: Product Info */}
                    {/* Right: Product Info */}
                    <div className="space-y-6 sticky top-24 h-fit">
                        {/* Brand & Title */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">{product.brand}</h2>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg text-gray-600 flex-1">{product.name}</h1>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            openAuthModal('login');
                                            return;
                                        }
                                        toggleWishlist(product);
                                    }}
                                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${isInWishlist(product.id)
                                        ? 'text-[var(--brand-royal-red)] bg-red-50'
                                        : 'text-gray-400 hover:text-[var(--brand-royal-red)] hover:bg-red-50'
                                        }`}
                                    aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm font-bold">
                                <span>{product.rating}</span>
                                <span>★</span>
                            </div>
                            <span className="text-sm text-gray-600">{product.reviewCount} Ratings</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                            <span className="text-2xl font-bold text-gray-900">৳{product.price}</span>
                            {product.discount > 0 && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">MRP ৳{product.mrp}</span>
                                    <span className="text-[var(--brand-royal-red)] font-bold">({product.discount}% OFF)</span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-green-600 font-medium -mt-4">inclusive of all taxes</p>

                        {/* Size Selector */}
                        <div id="size-selector" className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase">Select Size</h3>
                                <button
                                    onClick={() => setShowSizeChart(true)}
                                    className="text-sm text-[var(--brand-royal-red)] font-bold hover:underline"
                                >
                                    SIZE CHART →
                                </button>
                            </div>
                            <div className="flex gap-3">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => {
                                            setSelectedSize(size);
                                            setSizeError(false);
                                        }}
                                        className={`w-14 h-14 rounded-full border-2 font-bold transition-all ${selectedSize === size
                                            ? 'border-[var(--brand-royal-red)] text-[var(--brand-royal-red)]'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {sizeError && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm animate-shake">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    <span className="font-medium">Please select a size before adding to bag</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToBag}
                                className="flex-1 bg-[var(--brand-royal-red)] text-white py-4 rounded font-bold text-sm uppercase hover:bg-[#a01830] transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                Add to Bag
                            </button>
                            <button
                                onClick={handleOrderNow}
                                className="flex-1 px-6 py-4 border-2 border-[var(--brand-royal-red)] text-[var(--brand-royal-red)] bg-red-50 rounded font-bold text-sm uppercase hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"></path>
                                    <path d="M12 5l7 7-7 7"></path>
                                </svg>
                                Order Now
                            </button>
                        </div>

                        {/* Delivery Options */}
                        <div className="pb-6 border-b border-gray-200">
                            <h3 className="text-sm font-bold uppercase mb-4">Delivery Options</h3>
                            <div className="relative">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter your district or area"
                                        value={deliveryQuery}
                                        onChange={(e) => {
                                            const query = e.target.value;
                                            setDeliveryQuery(query);
                                            if (query.length >= 2) {
                                                const results = searchLocation(query);
                                                setDeliveryResults(results);
                                                setShowDeliveryDropdown(true);
                                            } else {
                                                setDeliveryResults([]);
                                                setShowDeliveryDropdown(false);
                                            }
                                        }}
                                        onFocus={() => {
                                            if (deliveryResults.length > 0) {
                                                setShowDeliveryDropdown(true);
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--brand-royal-red)]"
                                    />
                                    <button
                                        onClick={() => {
                                            if (deliveryResults.length > 0) {
                                                setSelectedDelivery(deliveryResults[0]);
                                                setShowDeliveryDropdown(false);
                                            }
                                        }}
                                        className="px-6 py-2 text-[var(--brand-royal-red)] font-bold border border-[var(--brand-royal-red)] rounded hover:bg-red-50 transition-colors"
                                    >
                                        Check
                                    </button>
                                </div>

                                {/* Autocomplete Dropdown */}
                                {showDeliveryDropdown && deliveryResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                                        {deliveryResults.map((result, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedDelivery(result);
                                                    setDeliveryQuery(result.name);
                                                    setShowDeliveryDropdown(false);
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                                                        <p className="text-xs text-gray-500">{result.deliveryTime} • ৳{result.deliveryCharge}</p>
                                                    </div>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Delivery Info */}
                            {selectedDelivery && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-gray-900 mb-2">Delivery Available</h4>
                                            <div className="space-y-1.5 text-sm">
                                                <p className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="1" y="3" width="15" height="13"></rect>
                                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                                    </svg>
                                                    <span className="text-gray-700">Estimated delivery: <strong className="text-green-700">{selectedDelivery.deliveryTime}</strong></span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                                    </svg>
                                                    <span className="text-gray-700">Delivery charge: <strong className="text-green-700">৳{selectedDelivery.deliveryCharge}</strong></span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    <span className="text-gray-700">Cash on Delivery available</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 mt-3">Enter your district or area to check delivery time & charges</p>
                            <div className="mt-4 space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>100% Original Products</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Pay on delivery available</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Easy 14 days returns and exchanges</span>
                                </p>
                            </div>
                        </div>

                        {/* Best Offers */}
                        <div className="pb-6 border-b border-gray-200">
                            <button
                                onClick={() => setShowOffers(!showOffers)}
                                className="w-full flex items-center justify-between text-sm font-bold uppercase mb-4"
                            >
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                    </svg>
                                    Best Offers
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-transform ${showOffers ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            {showOffers && (
                                <div className="space-y-4">
                                    {product.offers.map((offer, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200">
                                            <p className="text-sm font-bold mb-1">Best Price: ৳{product.price}</p>
                                            {offer.code && (
                                                <p className="text-sm mb-1">
                                                    Coupon code: <span className="font-bold">{offer.code}</span>
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600">{offer.title}</p>
                                            {offer.discount && (
                                                <p className="text-sm text-gray-600">{offer.discount}</p>
                                            )}
                                            {offer.minSpend && (
                                                <p className="text-sm text-gray-600">
                                                    Min Spend {offer.minSpend}, Max Discount {offer.maxDiscount}
                                                </p>
                                            )}
                                            <button className="text-[var(--brand-royal-red)] text-sm font-bold mt-2 hover:underline">
                                                Terms & Condition
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Product Details Section (Moved to Right Column) */}
                        <ProductDetailsSection product={product} />
                    </div>
                </div>

                {/* Product Details Section */}


                {/* Similar Products - Only show if we have related products from API */}
                {relatedProducts.length > 0 && (
                    <SimilarProductsSection products={relatedProducts} />
                )}

                {/* Customers Also Liked - Products from same category */}
                {categoryProducts.length > 0 && (
                    <CustomersAlsoLikedSection products={categoryProducts} />
                )}
            </div>

            {/* Image Lightbox */}
            {showLightbox && (
                <div
                    className="fixed inset-0 bg-white md:bg-gray-900/60 md:backdrop-blur-[3px] z-[100] flex items-center justify-center p-0 md:p-8"
                    onClick={() => setShowLightbox(false)}
                >
                    {/* Shrink-wrapped Content Container */}
                    <div className="relative w-full h-full md:w-auto md:h-auto md:inline-block flex items-center justify-center bg-white md:bg-transparent" onClick={(e) => e.stopPropagation()}>

                        {/* Close Button - Mobile: Top Left, Desktop: Top Right */}
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 left-4 md:left-auto md:right-2 z-50 md:z-40 text-black md:bg-white/90 md:hover:bg-white md:text-gray-900 p-2 rounded-full transition-colors md:shadow-lg"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {/* Previous Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                            }}
                            className="absolute left-2 md:-left-14 top-1/2 -translate-y-1/2 z-40 bg-white/80 md:bg-white hover:bg-gray-100 text-gray-900 p-3 rounded-full transition-colors shadow-lg"
                            aria-label="Previous image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                            }}
                            className="absolute right-2 md:-right-14 top-1/2 -translate-y-1/2 z-40 bg-white/80 md:bg-white hover:bg-gray-100 text-gray-900 p-3 rounded-full transition-colors shadow-lg"
                            aria-label="Next image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>

                        {/* Thumbnail Strip - Vertical Overlay Top Left (Desktop Only) */}
                        <div
                            className="hidden md:flex absolute left-4 top-4 z-30 flex-col max-h-[80vh] overflow-y-auto no-scrollbar"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative w-14 h-16 flex-shrink-0 overflow-hidden transition-all ${selectedImage === index
                                        ? 'ring-2 ring-[var(--brand-royal-red)] opacity-100 z-10'
                                        : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="relative w-full h-full md:w-auto md:h-auto flex items-center justify-center">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="w-full h-auto max-h-full md:h-[95vh] md:w-auto md:max-w-[90vw] object-contain md:rounded md:shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Size Chart Modal */}
            <SizeChartModal
                isOpen={showSizeChart}
                onClose={() => setShowSizeChart(false)}
                product={product}
            />
        </div>
    );
};

// Product Details Section Component
const ProductDetailsSection = ({ product }) => {
    const [activeTab, setActiveTab] = useState('details');

    return (
        <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="space-y-6">
                {/* Product Details */}
                <details open className="border-b border-gray-200 pb-6 group">
                    <summary className="text-sm font-bold uppercase cursor-pointer flex items-center justify-between list-none">
                        <span>Product Details</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-180">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </summary>
                    <div className="mt-4 text-sm text-gray-700 space-y-2">
                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                        <div className="mt-4">
                            <h4 className="font-bold mb-2">Size & Fit</h4>
                            <p>{product.details.fit}</p>
                            <p>Size worn by the model: {product.details.sizeWornByModel}</p>
                            <p>Chest: {product.details.modelStats.chest}</p>
                            <p>Height: {product.details.modelStats.height}</p>
                        </div>
                    </div>
                </details>

                {/* Material & Care */}
                <details open className="border-b border-gray-200 pb-6 group">
                    <summary className="text-sm font-bold uppercase cursor-pointer flex items-center justify-between list-none">
                        <span>Material & Care</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-180">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </summary>
                    <div className="mt-4 text-sm text-gray-700">
                        <p>{product.materialCare.material}</p>
                        <p>{product.materialCare.wash}</p>
                    </div>
                </details>

                {/* Specifications */}
                <details open className="border-b border-gray-200 pb-6 group">
                    <summary className="text-sm font-bold uppercase cursor-pointer flex items-center justify-between list-none">
                        <span>Specifications</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-180">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </summary>
                    <div className="mt-4 text-sm">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-500 capitalize text-xs">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="font-medium text-gray-900 text-right">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </details>

                {/* Ratings & Reviews */}
                <RatingsSection product={product} />
            </div>
        </div>
    );
};

// Ratings Section Component
const RatingsSection = ({ product }) => {
    const totalReviews = product.reviewCount;
    // Removed old state: userRating, userComment, submitting, message
    const { user, openAuthModal } = useAuth();
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Import isomorphic-dompurify for safe HTML rendering
    // Since we can't easily add imports to top of file with replace_file_content if we are targeting this block, 
    // we will assume it's added or use a different strategy. 
    // Wait, I should add the import at the top first or use dynamic import or just trust the next step. 
    // Actually, I can render raw html with caution since user asked for it, but better to use a library.
    // I will use `dangerouslySetInnerHTML` for now as requested in the broad plan, but I need to make sure I import the library at the top.

    return (
        <details open className="border-b border-gray-200 pb-6">
            <summary className="text-sm font-bold uppercase cursor-pointer flex items-center gap-2">
                <span>Ratings & Reviews</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </summary>
            <div className="mt-6">
                {/* Write Review Button */}
                <div className="mb-8 p-8 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <h4 className="font-bold text-lg mb-2">Have you used this product?</h4>
                    <p className="text-gray-600 mb-6 text-sm">Your review will help others make a better choice.</p>
                    <button
                        onClick={() => {
                            if (!user) {
                                openAuthModal('login');
                            } else {
                                setShowReviewModal(true);
                            }
                        }}
                        className="bg-[var(--brand-royal-red)] text-white px-8 py-3 rounded font-bold text-sm uppercase hover:bg-[#a01830] transition-colors shadow-lg hover:shadow-xl transform active:scale-95"
                    >
                        Write a Review
                    </button>
                </div>

                {/* Rating Summary */}
                <div className="flex items-start gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold mb-1">{product.rating} ★</div>
                        <p className="text-sm text-gray-600">{totalReviews} Verified Buyers</p>
                    </div>
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-sm w-4">{star}</span>
                                <span className="text-gray-400">★</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-600"
                                        style={{ width: `${totalReviews > 0 ? (product.ratings[star] / totalReviews) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-8">{product.ratings[star]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer Reviews */}
                <div className="space-y-8">
                    <h4 className="font-bold text-sm uppercase border-b border-gray-100 pb-2">Customer Reviews ({product.reviews.length})</h4>
                    {product.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                            {/* Review Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {review.customer?.image ? (
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <Image
                                                src={review.customer.image}
                                                alt={review.customer.name}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {review.customer?.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{review.customer?.name || review.author}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded flex items-center gap-0.5">
                                                <span>{review.rating}</span>
                                                <span className="text-[8px]">★</span>
                                            </div>
                                            <span className="text-xs text-gray-400">• {review.date || new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className="pl-13 ml-1">
                                {/* Comment (HTML) */}
                                <div
                                    className="text-sm text-gray-700 mb-3 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.comment || review.text) }}
                                />

                                {/* Review Media */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {review.images.filter(img => img && img.trim() !== "").map((media, idx) => {
                                            const isVideo = media.match(/\.(mp4|mov|webm|ogg)$/i);
                                            return (
                                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded border border-gray-200 overflow-hidden cursor-pointer group">
                                                    {isVideo ? (
                                                        <video
                                                            src={media}
                                                            className="w-full h-full object-cover"
                                                            controls={false} // Show controls only on click/modal ideally, but simple for now
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={media}
                                                            alt={`Review image ${idx + 1}`}
                                                            fill
                                                            className="object-cover transition-transform group-hover:scale-105"
                                                            unoptimized
                                                        />
                                                    )}
                                                    {isVideo && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10">
                                                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900 ml-1">
                                                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {product.reviews.length > 2 && (
                        <button className="text-[var(--brand-royal-red)] font-bold text-sm hover:underline pl-1 ml-13">
                            View all {product.reviewCount} reviews
                        </button>
                    )}
                </div>
            </div>

            {/* Write Review Modal */}
            <WriteReviewModal
                product={product}
                productId={product.id}
                open={showReviewModal}
                onClose={() => setShowReviewModal(false)}
            />
        </details>
    );
};

// Similar Products Section
const SimilarProductsSection = ({ products }) => {
    return (
        <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold mb-6 uppercase">Similar Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

// Customers Also Liked Section
const CustomersAlsoLikedSection = ({ products }) => {
    return (
        <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold mb-6 uppercase">Customers Also Liked</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductDetailsPage;
