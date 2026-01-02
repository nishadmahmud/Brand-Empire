"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(60); // Default Dhaka delivery

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('brand_empire_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('brand_empire_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Add item to cart
    const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
        setCartItems(prevItems => {
            // Check if item already exists with same size and color
            const existingItemIndex = prevItems.findIndex(
                item => item.id === product.id &&
                    item.selectedSize === selectedSize &&
                    item.selectedColor === selectedColor
            );

            if (existingItemIndex > -1) {
                // Update quantity of existing item
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += quantity;
                return updatedItems;
            } else {
                // Add new item
                return [...prevItems, {
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
                    discount: product.discount || null,
                    image: product.images?.[0] || product.image,
                    quantity: quantity,
                    selectedSize: selectedSize,
                    selectedColor: selectedColor,
                    brand: product.brand || null,
                    maxStock: product.stock || 99
                }];
            }
        });

    };

    // Remove item from cart
    const removeFromCart = (productId, selectedSize = null, selectedColor = null) => {
        setCartItems(prevItems =>
            prevItems.filter(item =>
                !(item.id === productId &&
                    item.selectedSize === selectedSize &&
                    item.selectedColor === selectedColor)
            )
        );
    };

    // Update item quantity
    const updateQuantity = (productId, quantity, selectedSize = null, selectedColor = null) => {
        if (quantity <= 0) {
            removeFromCart(productId, selectedSize, selectedColor);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === productId &&
                    item.selectedSize === selectedSize &&
                    item.selectedColor === selectedColor) {
                    return {
                        ...item,
                        quantity: Math.min(quantity, item.maxStock)
                    };
                }
                return item;
            })
        );
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('brand_empire_cart');
    };

    // Get total number of items
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Calculate subtotal
    const getSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Calculate total
    const getTotal = () => {
        return getSubtotal() + deliveryFee;
    };

    // Update delivery fee based on location
    const updateDeliveryFee = (fee) => {
        setDeliveryFee(fee);
    };

    // Toggle cart modal
    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const value = {
        cartItems,
        isCartOpen,
        deliveryFee,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getSubtotal,
        getTotal,
        updateDeliveryFee,
        toggleCart,
        setIsCartOpen
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
