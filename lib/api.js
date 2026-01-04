/**
 * API Library for Brand Empire
 * Contains all server-side data fetching functions
 */

/**
 * Fetch categories from server
 * @returns {Promise<Object>} Categories data
 */
export async function getCategoriesFromServer() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/categories/${process.env.NEXT_PUBLIC_USER_ID}`,
        {
            next: { revalidate: 60 }, // ISR - revalidate every 60 seconds
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch categories");
    }

    return res.json();
}

/**
 * Fetch new arrivals from server
 * @returns {Promise<Object>} New arrivals data
 */
export async function getNewArrivalsFromServer() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/new-arrivals/${process.env.NEXT_PUBLIC_USER_ID}`,
        {
            next: { revalidate: 60 * 10 }, // ISR - revalidate every 10 minutes
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch new arrivals");
    }

    return res.json();
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
 * Fetch sliders from server
 * @returns {Promise<Object>} Sliders data
 */
export async function getSlidersFromServer() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/sliders/${process.env.NEXT_PUBLIC_USER_ID}`,
        {
            next: { revalidate: 300 }, // ISR - revalidate every 5 minutes
        }
    );

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch sliders:", res.status, errorText);
        throw new Error(`Failed to fetch sliders. Status ${res.status}`);
    }

    return res.json();
}

/**
 * Fetch banners from server
 * @returns {Promise<Object>} Banners data
 */
export async function getBannerFromServer() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/banners/${process.env.NEXT_PUBLIC_USER_ID}`,
        {
            next: { revalidate: 60 }, // ISR - revalidate every 60 seconds
        }
    );

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch banners:", res.status, errorText);
        throw new Error("Failed to fetch banners");
    }

    return res.json();
}

/**
 * Fetch related products for a given product
 * @param {string} product_id - Product ID
 * @returns {Promise<Object>} Related products data
 */
export async function getRelatedProduct(product_id) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/get-related-products`,
        {
            method: "POST",
            body: JSON.stringify({
                product_id,
                user_id: process.env.NEXT_PUBLIC_USER_ID,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return await res.json();
}

/**
 * Fetch topbar data
 * @returns {Promise<Object>} Topbar data
 */
export async function getTopbarData() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/topbars/${process.env.NEXT_PUBLIC_USER_ID}`,
        { next: { revalidate: 300 } } // ISR - revalidate every 5 minutes
    );

    return await res.json();
}

/**
 * Fetch menu/header data
 * @returns {Promise<Object>} Menu data
 */
export async function getMenuData() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/headers/${process.env.NEXT_PUBLIC_USER_ID}`,
        { next: { revalidate: 300 } } // ISR - revalidate every 5 minutes
    );

    return await res.json();
}

/**
 * Fetch footer data
 * @returns {Promise<Object>} Footer data
 */
export async function getFooterData() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/footers/${process.env.NEXT_PUBLIC_USER_ID}`,
        { next: { revalidate: 300 } } // ISR - revalidate every 5 minutes
    );

    if (!res.ok) {
        const errorText = await res.text();
        console.log(errorText);
        throw new Error(`Failed to fetch footer. Status ${res.status}`);
    }

    return await res.json();
}

/**
 * Fetch products with pagination and category filter
 * @param {number} page - Page number (default: 1)
 * @param {number} category_id - Category ID (default: 0 for all)
 * @returns {Promise<Object>} Products data
 */
export async function getProducts(page = 1, category_id = 0) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/v1/publlic/products/userwise?user_id=${process.env.NEXT_PUBLIC_USER_ID}&page=${page}&per_page=20&category_id=${category_id}`
    );

    return await res.json();
}

/**
 * Fetch featured categories
 * @returns {Promise<Object>} Featured categories data
 */
export async function getFeaturedCategories() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/featured-categories/${process.env.NEXT_PUBLIC_USER_ID}`
    );

    return await res.json();
}

/**
 * Fetch campaigns
 * @returns {Promise<Object>} Campaigns data
 */
export async function getCampaigns() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/campaigns/${process.env.NEXT_PUBLIC_USER_ID}`
    );

    return await res.json();
}

/**
 * Fetch popup banners
 * @returns {Promise<Object>} Popup banners data
 */
export async function getPopupBanners() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/popups/${process.env.NEXT_PUBLIC_USER_ID}`,
        {
            next: { revalidate: 300 }, // ISR - revalidate every 5 minutes
        }
    );

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch popup banners:", res.status, errorText);
        throw new Error("Failed to fetch popup banners");
    }

    return await res.json();
}

/**
 * Fetch single product details by ID
 * @param {string|number} product_id - Product ID
 * @returns {Promise<Object>} Product details data
 */
export async function getProductById(product_id) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/public/products-detail/${product_id}`,
        {
            next: { revalidate: 60 }, // ISR - revalidate every 60 seconds
        }
    );

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch product details:", res.status, errorText);
        throw new Error(`Failed to fetch product details for ID ${product_id}`);
    }

    return await res.json();
}
