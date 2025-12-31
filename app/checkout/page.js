"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { searchLocation } from '@/data/deliveryData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CheckoutPage = () => {
    const router = useRouter();
    const {
        cartItems,
        getSubtotal,
        deliveryFee,
        updateDeliveryFee,
        getTotal,
        clearCart
    } = useCart();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        deliveryMethod: 'standard',
        paymentMethod: 'cod',
        orderNotes: '',
        termsAccepted: false
    });

    // Delivery autocomplete
    const [deliveryQuery, setDeliveryQuery] = useState('');
    const [deliveryResults, setDeliveryResults] = useState([]);
    const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    // Form validation errors
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if cart is empty
    if (cartItems.length === 0) {
        router.push('/cart');
        return null;
    }

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle delivery search
    const handleDeliverySearch = (query) => {
        setDeliveryQuery(query);
        if (query.length >= 2) {
            const results = searchLocation(query);
            setDeliveryResults(results);
            setShowDeliveryDropdown(true);
        } else {
            setDeliveryResults([]);
            setShowDeliveryDropdown(false);
        }
    };

    // Select delivery location
    const selectDeliveryLocation = (location) => {
        setSelectedDelivery(location);
        setDeliveryQuery(location.name);
        setFormData(prev => ({ ...prev, district: location.name }));
        updateDeliveryFee(location.deliveryCharge);
        setShowDeliveryDropdown(false);
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else if (!/^01[0-9]{9}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be 11 digits starting with 01';
        }
        if (!formData.address.trim() || formData.address.length < 10) {
            newErrors.address = 'Address must be at least 10 characters';
        }
        if (!formData.district.trim()) {
            newErrors.district = 'Please select your district/area';
        }
        if (!formData.termsAccepted) {
            newErrors.termsAccepted = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Prepare order data
        const orderData = {
            customer: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                district: formData.district
            },
            items: cartItems,
            delivery: {
                method: formData.deliveryMethod,
                fee: deliveryFee,
                location: selectedDelivery
            },
            payment: {
                method: formData.paymentMethod
            },
            totals: {
                subtotal: getSubtotal(),
                deliveryFee: deliveryFee,
                total: getTotal()
            },
            notes: formData.orderNotes,
            createdAt: new Date().toISOString()
        };

        // Simulate API call (replace with actual API call later)
        setTimeout(() => {
            console.log('Order submitted:', orderData);
            clearCart();
            router.push('/order-success');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <h1 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-wider">
                    Checkout
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-lg font-bold uppercase mb-4">Customer Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[var(--brand-royal-red)]`}
                                            placeholder="John Doe"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[var(--brand-royal-red)]`}
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[var(--brand-royal-red)]`}
                                                placeholder="01XXXXXXXXX"
                                            />
                                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-lg font-bold uppercase mb-4">Delivery Address</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows="3"
                                            className={`w-full px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[var(--brand-royal-red)]`}
                                            placeholder="House/Flat No, Street, Area"
                                        />
                                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            District/Area <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={deliveryQuery}
                                            onChange={(e) => handleDeliverySearch(e.target.value)}
                                            onFocus={() => {
                                                if (deliveryResults.length > 0) {
                                                    setShowDeliveryDropdown(true);
                                                }
                                            }}
                                            className={`w-full px-4 py-2 border ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-[var(--brand-royal-red)]`}
                                            placeholder="Search district or area"
                                        />
                                        {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}

                                        {/* Autocomplete Dropdown */}
                                        {showDeliveryDropdown && deliveryResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                                                {deliveryResults.map((result, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => selectDeliveryLocation(result)}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                                                        <p className="text-xs text-gray-500">{result.deliveryTime} • ৳{result.deliveryCharge}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {selectedDelivery && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                                                <p className="font-medium text-green-800">Delivery: {selectedDelivery.deliveryTime}</p>
                                                <p className="text-green-700">Charge: ৳{selectedDelivery.deliveryCharge}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Method */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-lg font-bold uppercase mb-4">Delivery Method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="standard"
                                            checked={formData.deliveryMethod === 'standard'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[var(--brand-royal-red)]"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">Standard Delivery</p>
                                            <p className="text-sm text-gray-600">Delivery within {selectedDelivery?.deliveryTime || '2-3 days'}</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-lg font-bold uppercase mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[var(--brand-royal-red)]"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">Cash on Delivery</p>
                                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 opacity-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="online"
                                            disabled
                                            className="w-4 h-4 text-[var(--brand-royal-red)]"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">Online Payment</p>
                                            <p className="text-sm text-gray-600">Coming soon</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Order Notes */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-lg font-bold uppercase mb-4">Order Notes (Optional)</h2>
                                <textarea
                                    name="orderNotes"
                                    value={formData.orderNotes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--brand-royal-red)]"
                                    placeholder="Any special instructions for your order"
                                />
                            </div>

                            {/* Terms and Conditions */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        className="mt-1 w-4 h-4 text-[var(--brand-royal-red)]"
                                    />
                                    <div>
                                        <p className="text-sm">
                                            I agree to the <Link href="/terms" className="text-[var(--brand-royal-red)] hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-[var(--brand-royal-red)] hover:underline">Privacy Policy</Link>
                                        </p>
                                        {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
                                <h2 className="text-lg font-bold uppercase mb-4">Order Summary</h2>

                                {/* Cart Items */}
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                                            <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover rounded"
                                                    unoptimized
                                                />
                                                <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                {(item.selectedSize || item.selectedColor) && (
                                                    <p className="text-xs text-gray-500">
                                                        {item.selectedSize && `Size: ${item.selectedSize}`}
                                                        {item.selectedSize && item.selectedColor && ' • '}
                                                        {item.selectedColor && `${item.selectedColor}`}
                                                    </p>
                                                )}
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    ৳{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t border-gray-300 pt-4 space-y-2 mb-6">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span className="font-medium">৳{getSubtotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Delivery Fee</span>
                                        <span className="font-medium">৳{deliveryFee.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>৳{getTotal().toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-[var(--brand-royal-red)] text-white font-bold uppercase text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Processing...' : 'Place Order'}
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Your personal data will be used to process your order and support your experience throughout this website.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default CheckoutPage;
