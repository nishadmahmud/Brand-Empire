"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const CartPage = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        updateSize,
        toggleItemSelection,
        selectAllItems,
        getSelectedCount,
        getSubtotal,
        deliveryFee,
        getTotal
    } = useCart();

    const { user, openAuthModal } = useAuth();
    const router = useRouter();

    const [openSizeModal, setOpenSizeModal] = React.useState(null); // stores item ID to show modal for

    // Helper to calculate total MRP (Selected Items Only)
    const getTotalMRP = () => {
        return cartItems.reduce((total, item) => {
            if (!item.selected) return total;
            const price = item.originalPrice || item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const totalMRP = getTotalMRP();
    const subTotal = getSubtotal();
    const totalDiscount = totalMRP - subTotal;
    const selectedCount = getSelectedCount();
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pb-10"> {/* Removed pt-20, handled by layout */}
                <div className="text-center max-w-md px-4">
                    <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--brand-royal-red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Your Bag is Empty</h2>
                    <p className="text-gray-500 mb-8 text-sm">
                        Looks like you haven't added anything to your bag yet.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-12 py-3 bg-[var(--brand-royal-red)] text-white font-bold uppercase text-xs tracking-wider rounded shadow hover:bg-red-700 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10"> {/* Removed pt-[100px] */}
            <div className="max-w-[1000px] mx-auto px-4 pt-6"> {/* Added pt-6 for spacing from navbar */}

                {/* Header Row (Moved outside grid for alignment) */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => selectAllItems(e.target.checked)}
                                className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 rounded focus:ring-[var(--brand-royal-red)]"
                            />
                            <span className="text-sm font-bold text-gray-700 uppercase">
                                {selectedCount} / {cartItems.length} ITEMS SELECTED
                            </span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
                    {/* Left Column: Items */}
                    <div className="space-y-4">

                        {/* Login Banner (if not logged in) */}
                        {!user && (
                            <div className="bg-white p-4 rounded border border-gray-200 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Login to see items from your existing bag and wishlist.</p>
                                </div>
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="text-[var(--brand-royal-red)] font-bold text-xs uppercase hover:underline"
                                >
                                    Login Now
                                </button>
                            </div>
                        )}

                        {/* Items List */}
                        <div className="space-y-3">
                            {cartItems.map((item, index) => (
                                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className={`relative bg-white border rounded p-3 shadow-sm group transition-colors ${item.selected ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-75'}`}>

                                    {/* Checkbox Absolute Top Left */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <input
                                            type="checkbox"
                                            checked={item.selected || false}
                                            onChange={() => toggleItemSelection(item.id, item.selectedSize, item.selectedColor)}
                                            className="w-4 h-4 text-[var(--brand-royal-red)] border-gray-300 rounded focus:ring-[var(--brand-royal-red)] cursor-pointer"
                                        />
                                    </div>

                                    {/* Close/Remove Button Top Right */}
                                    <button
                                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>

                                    <div className="flex gap-4 pl-8"> {/* Added pl-8 to make room for checkbox */}
                                        {/* Image */}
                                        <div className="w-28 h-36 flex-shrink-0 bg-gray-100 rounded overflow-hidden relative">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>

                                        {/* info */}
                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className="font-bold text-sm text-gray-900 mb-1">{item.brand || "Brand Empire"}</h3>
                                            <p className="text-sm text-gray-500 truncate mb-2">{item.name}</p>

                                            {/* Selectors Row */}
                                            <div className="flex items-center gap-3 mb-3">
                                                {/* Size Selector */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenSizeModal(item)}
                                                        className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-bold text-gray-800 flex items-center gap-1"
                                                    >
                                                        Size: {item.selectedSize || 'N/A'}
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="6 9 12 15 18 9"></polyline>
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Qty Selector */}
                                                <div className="relative">
                                                    <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-800 flex items-center gap-2">
                                                        <span>Qty:</span>
                                                        <button
                                                            className="hover:text-[var(--brand-royal-red)]"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                                                        >-</button>
                                                        <span>{item.quantity}</span>
                                                        <button
                                                            className="hover:text-[var(--brand-royal-red)]"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                                                        >+</button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                                                {item.originalPrice && (
                                                    <span className="text-xs text-gray-400 line-through">৳{(item.originalPrice * item.quantity).toLocaleString()}</span>
                                                )}
                                                {item.discount && (
                                                    <span className="text-xs text-[var(--brand-royal-red)] font-bold">{item.discount}% OFF</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>7 days return available</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Price Details & Coupons */}
                    <div className="h-fit space-y-4">

                        {/* Coupons Section */}
                        <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                            <h2 className="text-xs font-bold text-gray-500 uppercase mb-3">Coupons</h2>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                    </svg>
                                    <span className="font-bold text-sm">Apply Coupons</span>
                                </div>
                                <button className="text-[var(--brand-royal-red)] text-xs font-bold border border-[var(--brand-royal-red)] px-3 py-1 rounded hover:bg-red-50 transition-colors uppercase">
                                    Apply
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-royal-red)]"
                                />
                            </div>
                        </div>

                        {/* Price Details */}
                        <div className="bg-white border border-gray-200 rounded p-4 shadow-sm sticky top-28">
                            <h2 className="text-xs font-bold text-gray-500 uppercase mb-4">Price Details ({selectedCount} Selected)</h2>

                            <div className="space-y-3 mb-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total MRP</span>
                                    <span className="text-gray-900">৳{totalMRP.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount on MRP</span>
                                    <span className="text-green-600">-৳{totalDiscount.toLocaleString()}</span>
                                </div>
                                {/* Coupon Discount Skipped as requested */}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="text-sm text-[var(--brand-royal-red)] font-medium">Calculated at Checkout</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="font-bold text-gray-900 text-lg">৳{subTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (selectedCount === 0) {
                                        alert("Please select at least one item to proceed.");
                                        return;
                                    }
                                    if (!user) {
                                        openAuthModal('login');
                                    } else {
                                        router.push('/checkout');
                                    }
                                }}
                                className={`block w-full py-3 text-center font-bold text-sm uppercase rounded shadow-md transition-colors ${selectedCount > 0 ? 'bg-[var(--brand-royal-red)] text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                disabled={selectedCount === 0}
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Size Selection Modal/Overlay */}
            {openSizeModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setOpenSizeModal(null)}
                >
                    <div
                        className="bg-white rounded-lg w-full max-w-sm p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 uppercase">Select Size</h3>
                            <button onClick={() => setOpenSizeModal(null)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden relative border border-gray-200">
                                <Image
                                    src={openSizeModal.image}
                                    alt={openSizeModal.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">{openSizeModal.brand}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{openSizeModal.name}</p>
                                <p className="font-bold text-sm mt-1">৳{openSizeModal.price}</p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-4 gap-3">
                            {/* Use available sizes if present, otherwise fallback to defaults or current size */}
                            {(openSizeModal.availableSizes && openSizeModal.availableSizes.length > 0
                                ? openSizeModal.availableSizes
                                : ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => {
                                            updateSize(openSizeModal.id, openSizeModal.selectedSize, size, openSizeModal.selectedColor);
                                            setOpenSizeModal(null);
                                        }}
                                        className={`h-12 rounded-full border border-gray-300 font-bold text-sm hover:border-[var(--brand-royal-red)] hover:text-[var(--brand-royal-red)] transition-all ${openSizeModal.selectedSize === size ? 'bg-[var(--brand-royal-red)] text-white border-[var(--brand-royal-red)] hover:bg-red-700 hover:text-white' : 'text-gray-700'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};


export default CartPage;
