/**
 * API Library for Brand Empire
 * Contains all server-side data fetching functions
 */

// In-memory cache for API responses
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data or fetch from API
 * @param {string} cacheKey - Unique cache key
 * @param {Function} fetchFn - Function to call if cache miss
 * @returns {Promise<Object>} API response data
 */
async function getCachedOrFetch(cacheKey, fetchFn) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const data = await fetchFn();
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

/**
 * Clear specific cache entry or all cache
 * @param {string} cacheKey - Optional specific key to clear
 */
export function clearApiCache(cacheKey = null) {
    if (cacheKey) {
        apiCache.delete(cacheKey);
    } else {
        apiCache.clear();
    }
}

/**
 * Fetch categories from server (with caching)
 * @returns {Promise<Object>} Categories data
 */
export async function getCategoriesFromServer() {
    return getCachedOrFetch('categories', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/categories/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
    });
}

/**
 * Fetch new arrivals from server (with caching)
 * @returns {Promise<Object>} New arrivals data
 */
export async function getNewArrivalsFromServer() {
    return getCachedOrFetch('new_arrivals', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/new-arrivals/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 60 * 10 } }
        );
        if (!res.ok) throw new Error("Failed to fetch new arrivals");
        return res.json();
    });
}

/**
 * Fetch new user product discount from server
 * @returns {Promise<Object>} New customer discount data
 */
export async function getNewUserProductFromServer() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/new-customer-discount/${process.env.NEXT_PUBLIC_USER_ID}`,
        {
            cache: "no-cache",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch new customer discount");
    }

    return res.json();
}

/**
 * Fetch sliders from server (with caching)
 * @returns {Promise<Object>} Sliders data
 */
export async function getSlidersFromServer() {
    return getCachedOrFetch('sliders', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/sliders/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) throw new Error(`Failed to fetch sliders. Status ${res.status}`);
        return res.json();
    });
}

/**
 * Fetch banners from server (with caching)
 * @returns {Promise<Object>} Banners data
 */
export async function getBannerFromServer() {
    return getCachedOrFetch('banners', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/banners/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) throw new Error("Failed to fetch banners");
        return res.json();
    });
}

/**
 * Fetch related products for a given product (with caching)
 * @param {string} product_id - Product ID
 * @returns {Promise<Object>} Related products data
 */
export async function getRelatedProduct(product_id) {
    const cacheKey = `related_${product_id}`;
    return getCachedOrFetch(cacheKey, async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/get-related-products`,
            {
                method: "POST",
                body: JSON.stringify({
                    product_id,
                    user_id: process.env.NEXT_PUBLIC_USER_ID,
                }),
                headers: { "Content-Type": "application/json" },
            }
        );
        return await res.json();
    });
}

/**
 * Fetch topbar data (with caching)
 * @returns {Promise<Object>} Topbar data
 */
export async function getTopbarData() {
    return getCachedOrFetch('topbar', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/topbars/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 300 } }
        );
        return await res.json();
    });
}

/**
 * Fetch menu/header data (with caching)
 * @returns {Promise<Object>} Menu data
 */
export async function getMenuData() {
    return getCachedOrFetch('menu', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/headers/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 300 } }
        );
        return await res.json();
    });
}

/**
 * Fetch footer data (with caching)
 * @returns {Promise<Object>} Footer data
 */
export async function getFooterData() {
    return getCachedOrFetch('footer', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/footers/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) throw new Error(`Failed to fetch footer. Status ${res.status}`);
        return await res.json();
    });
}

/**
 * Fetch products with pagination and category/subcategory filter (with caching)
 * @param {number} page - Page number (default: 1)
 * @param {number} category_id - Category ID (default: 0 for all)
 * @param {number} subcategory_id - Subcategory ID (default: 0 for all)
 * @returns {Promise<Object>} Products data
 */
export async function getProducts(page = 1, category_id = 0, subcategory_id = 0) {
    const cacheKey = `products_page_${page}_cat_${category_id}_sub_${subcategory_id}`;
    return getCachedOrFetch(cacheKey, async () => {
        let url = `${process.env.NEXT_PUBLIC_API}/public/products/userwise?user_id=${process.env.NEXT_PUBLIC_USER_ID}&page=${page}&per_page=20&category_id=${category_id}`;
        if (subcategory_id && subcategory_id !== 0) {
            url += `&subcategory_id=${subcategory_id}`;
        }
        const res = await fetch(url);
        return await res.json();
    });
}

/**
 * Fetch products by subcategory (with caching)
 * @param {number} subcategory_id - Subcategory ID
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Products data
 */
export async function getProductsBySubcategory(subcategory_id, page = 1) {
    const cacheKey = `subcategory_${subcategory_id}_page_${page}`;
    return getCachedOrFetch(cacheKey, async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/subcategorywise-products/${subcategory_id}?page=${page}`
        );
        return await res.json();
    });
}

/**
 * Fetch products by child category (with caching)
 * @param {number} child_id - Child Category ID
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Products data
 */
export async function getProductsByChildCategory(child_id, page = 1) {
    const cacheKey = `child_${child_id}_page_${page}`;
    return getCachedOrFetch(cacheKey, async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/childcategorywise-products/${child_id}?page=${page}`
        );
        return await res.json();
    });
}

/**
 * Fetch products by brand (with caching)
 * @param {number} brand_id - Brand ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @returns {Promise<Object>} Products data
 */
export async function getBrandwiseProducts(brand_id, page = 1, limit = 20) {
    const cacheKey = `brand_${brand_id}_page_${page}_limit_${limit}`;
    return getCachedOrFetch(cacheKey, async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/brandwise-products/${brand_id}/${process.env.NEXT_PUBLIC_USER_ID}?page=${page}&limit=${limit}`
        );
        return await res.json();
    });
}

/**
 * Fetch products by category (with caching)
 * @param {string|number} category_id - Category ID
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Products data
 */
export async function getCategoryWiseProducts(category_id, page = 1) {
    const cacheKey = `category_${category_id}_page_${page}`;
    return getCachedOrFetch(cacheKey, async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/categorywise-products/${category_id}?page=${page}`
        );
        return await res.json();
    });
}

/**
 * Fetch featured categories (with caching)
 * @returns {Promise<Object>} Featured categories data
 */
export async function getFeaturedCategories() {
    return getCachedOrFetch('featured_categories', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/featured-categories/${process.env.NEXT_PUBLIC_USER_ID}`
        );
        return await res.json();
    });
}

/**
 * Fetch top brands (with caching)
 * @returns {Promise<Object>} Top brands data
 */
export async function getTopBrands() {
    return getCachedOrFetch('top_brands', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/brands/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 300 } }
        );
        return await res.json();
    });
}

/**
 * Fetch campaigns (with caching)
 * @returns {Promise<Object>} Campaigns data
 */
export async function getCampaigns() {
    return getCachedOrFetch('campaigns', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/campaigns/${process.env.NEXT_PUBLIC_USER_ID}`
        );
        return await res.json();
    });
}

/**
 * Fetch coupon list (with caching)
 * @returns {Promise<Object>} Coupons data
 */
export async function getCouponList() {
    return getCachedOrFetch('coupons', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/coupon-list/${process.env.NEXT_PUBLIC_USER_ID}`
        );
        return await res.json();
    });
}

/**
 * Collect a coupon for a customer
 * @param {string} couponCode - The coupon code to collect
 * @param {number} customerId - The customer ID
 * @returns {Promise<Object>} Response data
 */
export async function collectCoupon(couponCode, customerId) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/public/collect-coupon`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coupon_code: couponCode,
            customer_id: customerId,
            user_id: process.env.NEXT_PUBLIC_USER_ID
        }),
    });
    return res.json();
}

/**
 * Fetch latest blog posts (with caching)
 * @returns {Promise<Object>} Blog posts data
 */
export async function getBlogs() {
    return getCachedOrFetch('blogs', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/latest-ecommerce-blog-list/${process.env.NEXT_PUBLIC_USER_ID}`
        );
        return await res.json();
    });
}

/**
 * Fetch popup banners (with caching)
 * @returns {Promise<Object>} Popup banners data
 */
export async function getPopupBanners() {
    return getCachedOrFetch('popup_banners', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/popups/${process.env.NEXT_PUBLIC_USER_ID}`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) throw new Error("Failed to fetch popup banners");
        return await res.json();
    });
}

/**
 * Fetch single product details by ID (with caching)
 * @param {string|number} product_id - Product ID
 * @returns {Promise<Object>} Product details data
 */
export async function getProductById(product_id) {
    const cacheKey = `product_${product_id}`;
    return getCachedOrFetch(cacheKey, async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/products-detail/${product_id}`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) throw new Error(`Failed to fetch product details for ID ${product_id}`);
        return await res.json();
    });
}
/**
 * Customer Login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Login response
 */
export async function customerLogin(email, password) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/customer-login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
            user_id: process.env.NEXT_PUBLIC_USER_ID,
        }),
    });

    return res.json();
}

/**
 * Customer Registration
 * @param {Object} userData - { first_name, last_name, phone, email, password }
 * @returns {Promise<Object>} Registration response
 */
export async function customerRegister(userData) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/customer-registration`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...userData,
            user_id: process.env.NEXT_PUBLIC_USER_ID,
        }),
    });

    return res.json();
}

/**
 * Update Customer Profile
 * @param {string} token
 * @param {Object} profileData
 * @returns {Promise<Object>} Response
 */
export async function updateCustomerProfile(token, profileData) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/customer/update-profile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
    });

    return res.json();
}

/**
 * Get Customer Order List
 * @param {string} token
 * @param {number} customerId
 * @param {string} type - Order status type (default "1")
 * @returns {Promise<Object>} Response
 */
export async function getCustomerOrders(token, customerId, type = "1") {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/customer-order-list`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            type: type,
            customer_id: customerId,
            limit: "10"
        }),
    });

    return res.json();
}

/**
 * Update Customer Password
 * @param {string} token
 * @param {Object} passwordData - { email, current_password, new_password, new_password_confirmation }
 * @returns {Promise<Object>} Response
 */
export async function updateCustomerPassword(token, passwordData) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/customer/update-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(passwordData),
    });

    return res.json();
}

/**
 * Search for products (with caching)
 * @param {string} keyword - Search keyword
 * @returns {Promise<Object>} Search results
 */
export async function searchProducts(keyword) {
    const cacheKey = `search_${keyword}`;
    return getCachedOrFetch(cacheKey, async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/public/search-product`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                keyword: keyword,
                user_id: process.env.NEXT_PUBLIC_USER_ID,
                limit: 1000
            }),
        });
        return res.json();
    });
}

/**
 * Save sales order (Checkout)
 * @param {Object} orderData - Order payload
 * @returns {Promise<Object>} Response
 */
export async function saveSalesOrder(orderData) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/public/ecommerce-save-sales`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    });

    return res.json();
}

/**
 * Track Order
 * @param {Object} trackData - { invoice_id, phone }
 * @returns {Promise<Object>} Tracking response
 */
export async function trackOrder(trackData) {
    // trackData should contain { invoice_id }
    const payload = {
        invoice_id: trackData.invoice_id,
        user_id: process.env.NEXT_PUBLIC_USER_ID
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/search-web-invoice`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return res.json();
}


/**
 * Get Customer Coupons
 * @param {string|number} customerId - Customer ID
 * @returns {Promise<Object>} Coupon list response
 */
export async function getCustomerCoupons(customerId) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/public/get-customer-coupon/${customerId}`, {
        method: "GET",
    });

    return res.json();
}

/**
 * Get Studio List
 * @returns {Promise<Object>} Studio posts list
 */
export async function getStudioList() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/public/studio-list/${process.env.NEXT_PUBLIC_USER_ID}`, {
        cache: "no-cache",
    });

    return res.json();
}

/**
 * Submit a product review
 * @param {Object} reviewData - The review payload
 * @param {string} token - User's auth token
 * @returns {Promise<Object>} Response data
 */
export async function saveProductReview(reviewData, token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/customer/save-customer-review`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reviewData),
    });

    return res.json();
}

/**
 * Upload files for review
 * @param {FormData} formData - FormData containing files and user_id
 * @param {string} token - User's auth token
 * @returns {Promise<Object>} Response data
 */
/**
 * Upload files for review
 * @param {FormData} formData - FormData containing files and user_id
 * @param {string} token - User's auth token
 * @returns {Promise<Object>} Response data
 */
export async function uploadReviewMedia(formData, token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/customer/multiple-file-upload`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
            // Content-Type is inferred from FormData
        },
        body: formData,
    });

    return res.json();
}

/**
 * Upload single file (e.g., profile picture)
 * @param {FormData} formData - FormData containing file
 * @param {string} token - User's auth token
 * @returns {Promise<Object>} Response data
 */
export async function uploadSingleFile(formData, token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/customer/file-upload`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
            // Content-Type is inferred from FormData
        },
        body: formData,
    });

    return res.json();
}

/**
 * Fetch product reviews
 * @param {string|number} product_id - Product ID
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Review response data
 */
export async function getProductReviews(product_id, page = 1) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/public/get-product-reviews/${product_id}?page=${page}`, {
        method: "GET",
    });

    return res.json();
}

/**
 * Fetch attributes with values for filters (with caching)
 * @returns {Promise<Object>} Attributes with values data
 */
export async function getAttributes() {
    return getCachedOrFetch('attributes', async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/get-attribute-with-values/${process.env.NEXT_PUBLIC_USER_ID}`
        );
        return await res.json();
    });
}

/**
 * Filter products by attribute values
 * @param {Array} attributeValueIds - Array of attribute value IDs to filter by
 * @param {number} page - Page number for pagination
 * @param {Object} options - Optional filters (brandId, categoryId)
 * @returns {Promise<Object>} Filtered products data
 */
export async function filterProductsByAttributes(attributeValueIds = [], page = 1, options = {}) {
    const { brandId = null, categoryId = null } = options;
    const cacheKey = `filter_products_${attributeValueIds.sort().join('_')}_page_${page}_brand_${brandId || 'all'}_cat_${categoryId || 'all'}`;
    return getCachedOrFetch(cacheKey, async () => {
        // Build query params for attribute_value_ids[]
        const params = new URLSearchParams();
        params.append('user_id', process.env.NEXT_PUBLIC_USER_ID);
        params.append('page', page);
        attributeValueIds.forEach(id => {
            params.append('attribute_value_ids[]', id);
        });

        // Add brand_id if provided
        if (brandId) {
            params.append('brand_id', brandId);
        }

        // Add category_id if provided
        if (categoryId) {
            params.append('category_id', categoryId);
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API}/public/filter-products?${params.toString()}`
        );
        return await res.json();
    });
}

// ============================================
// STUDIO API ENDPOINTS
// ============================================

/**
 * Get public studio list
 * @param {number} userId - User ID to get studios for
 * @returns {Promise<Object>} Studio list data
 */
export async function getPublicStudioList(userId) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/studio-list/${userId}`
    );
    return await res.json();
}

/**
 * Get studio details by ID
 * @param {number} studioId - Studio ID
 * @returns {Promise<Object>} Studio details
 */
export async function getStudioDetails(studioId) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/studio-details/${studioId}`
    );
    return await res.json();
}

/**
 * Save a new studio post
 * @param {Object} studioData - Studio data { vendor_id, video_link, product_ids[], description }
 * @returns {Promise<Object>} Save response
 */
export async function saveStudio(studioData) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/save-studio`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(studioData),
    });
    return await res.json();
}

/**
 * Update an existing studio post
 * @param {number} studioId - Studio ID to update
 * @param {Object} studioData - Updated studio data { vendor_id, video_link, product_ids[], description }
 * @returns {Promise<Object>} Update response
 */
export async function updateStudio(studioId, studioData) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/update-studio/${studioId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(studioData),
    });
    return await res.json();
}

/**
 * Delete a studio post
 * @param {number} studioId - Studio ID to delete
 * @returns {Promise<Object>} Delete response
 */
export async function deleteStudio(studioId) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/delete-studio/${studioId}`, {
        method: "POST",
    });
    return await res.json();
}

/**
 * Apply coupon to track usage in backend
 * @param {string} couponCode - The coupon code to apply
 * @returns {Promise<Object>} API response
 */
export async function applyCoupon(couponCode) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/public/apply-coupon`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                coupon_code: couponCode,
                user_id: process.env.NEXT_PUBLIC_USER_ID,
            }),
        });
        return await res.json();
    } catch (error) {
        console.error("Error applying coupon:", error);
        return { success: false, message: "Failed to apply coupon" };
    }
}
