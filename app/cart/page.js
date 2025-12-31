"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CartPage = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        getSubtotal,
        deliveryFee,
        getTotal
    } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center py-20">
                    <div className="text-center max-w-md px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-6">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                        <p className="text-gray-600 mb-8">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-8 py-3 bg-[var(--brand-royal-red)] text-white font-bold uppercase text-sm hover:bg-red-700 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <h1 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-wider">
                    Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100 rounded">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover rounded"
                                            unoptimized
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                                {item.brand && (
                                                    <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                                className="text-gray-400 hover:text-red-600 transition-colors ml-4"
                                                aria-label="Remove item"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Variant Info */}
                                        {(item.selectedSize || item.selectedColor) && (
                                            <div className="flex gap-4 mb-3 text-sm text-gray-600">
                                                {item.selectedSize && (
                                                    <div>
                                                        <span className="font-medium">Size:</span> {item.selectedSize}
                                                    </div>
                                                )}
                                                {item.selectedColor && (
                                                    <div>
                                                        <span className="font-medium">Color:</span> {item.selectedColor}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Price and Quantity */}
                                        <div className="flex items-center justify-between mt-4">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700">Qty:</span>
                                                <div className="flex items-center border border-gray-300 rounded">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                                                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-4 py-2 font-medium border-x border-gray-300">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                                                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gray-900">
                                                    ৳{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-sm text-gray-500">
                                                        ৳{item.price.toLocaleString()} each
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Continue Shopping Button */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-[var(--brand-royal-red)] font-bold hover:underline mt-4"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
                            <h2 className="text-lg font-bold uppercase mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span className="font-medium">৳{getSubtotal().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Delivery Fee</span>
                                    <span className="font-medium">৳{deliveryFee.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>৳{getTotal().toLocaleString()}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full py-3 text-center bg-[var(--brand-royal-red)] text-white font-bold uppercase text-sm hover:bg-red-700 transition-colors mb-3"
                            >
                                Proceed to Checkout
                            </Link>

                            <p className="text-xs text-gray-500 text-center">
                                Shipping & taxes calculated at checkout
                            </p>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>100% Original Products</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>Cash on Delivery Available</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>Easy 14 Days Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CartPage;
