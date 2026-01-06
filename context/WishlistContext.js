"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const { showToast } = useToast();

    // Load wishlist from local storage on mount
    useEffect(() => {
        const storedWishlist = localStorage.getItem("wishlist");
        if (storedWishlist) {
            try {
                setWishlist(JSON.parse(storedWishlist));
            } catch (error) {
                console.error("Failed to parse wishlist from local storage", error);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save wishlist to local storage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
        }
    }, [wishlist, isInitialized]);

    const addToWishlist = (product) => {
        if (!isInWishlist(product.id)) {
            setWishlist((prev) => [...prev, product]);
            showToast({ ...product, message: "Added to Wishlist" });
        }
    };

    const removeFromWishlist = (productId) => {
        setWishlist((prev) => prev.filter((item) => item.id !== productId));
        // Optional: Show toast for removal? 
        // showToast({ message: "Removed from Wishlist" });
    };

    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some((item) => item.id === productId);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    return useContext(WishlistContext);
};
