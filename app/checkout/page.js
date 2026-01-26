"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { saveSalesOrder, getCouponList, applyCoupon } from "../../lib/api";
import {
    MapPin,
    CreditCard,
    ShoppingBag,
    Shield,
    Truck,
    User,
    Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import AddressSelect from "../../components/AddressSelect";

export default function CheckoutPage() {
    const { cartItems: allCartItems, getSubtotal, deliveryFee, updateDeliveryFee, clearCart } =
        useCart();

    // Filter to get only selected items for checkout
    const cartItems = allCartItems.filter(item => item.selected);
    const { user } = useAuth();
    const router = useRouter();

    const subTotal = getSubtotal();

    // Format price helper function
    const formatPrice = (amount) => {
        return `TK ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // We'll manage district/city separately now
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        phone: "",
        email: "",
        address: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);

    const [couponError, setCouponError] = useState("");
    const [donationAmount, setDonationAmount] = useState(0);

    const formRef = useRef(null);

    // Prefill form with user data
    // Load saved details on mount
    useEffect(() => {
        const savedDetails = localStorage.getItem("brandEmpireCheckoutDetails");
        if (savedDetails) {
            try {
                const parsed = JSON.parse(savedDetails);
                setFormData(prev => ({
                    ...prev,
                    firstName: parsed.firstName || prev.firstName,
                    phone: parsed.phone || prev.phone,
                    email: parsed.email || prev.email,
                    address: parsed.address || prev.address,
                }));
                if (parsed.district) setSelectedDistrict(parsed.district);
                if (parsed.city) setSelectedCity(parsed.city);
            } catch (e) {
                console.error("Failed to parse saved checkout details", e);
            }
        }
    }, []);

    // Prefill form with user data (User data takes precedence if available/loaded later, 
    // unless you want LS to win. Currently letting User win if fields match, but LS fills gaps)
    // Actually, usually we want User Profile to be the source of truth if logged in.
    // If the user modifies it and saves, it's in LS for next time.
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                firstName: user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.name || prev.firstName,
                phone: user.mobile_number || user.phone || prev.phone,
                email: user.email || prev.email,
                address: user.address || prev.address,
            }));
        }
    }, [user]);

    // Update delivery fee based on selection
    useEffect(() => {
        if (!selectedDistrict && !selectedCity) {
            updateDeliveryFee(0);
            return;
        }

        let fee = 130; // Default: Outside Dhaka

        // Priority: specific city rules first
        if (
            selectedCity === "Demra" ||
            selectedCity?.includes("Savar") ||
            selectedDistrict === "Gazipur" ||
            selectedCity?.includes("Keraniganj")
        ) {
            fee = 90;
        }
        // Then district-specific rules
        else if (selectedDistrict === "Dhaka") {
            fee = 70;
        } else {
            fee = 130;
        }
        updateDeliveryFee(fee);
    }, [selectedDistrict, selectedCity, updateDeliveryFee]);

    const grandTotal = subTotal + deliveryFee - couponDiscount + donationAmount;

    // Handle coupon application
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code");
            return;
        }

        setCouponLoading(true);
        setCouponError("");

        try {
            const response = await getCouponList();

            if (response.success && response.data) {
                // Find matching coupon (case-insensitive)
                const matchingCoupon = response.data.find(
                    coupon => coupon.coupon_code.toUpperCase() === couponCode.trim().toUpperCase()
                );

                if (matchingCoupon) {
                    // Check if coupon is expired
                    const now = new Date();
                    const expireDate = new Date(matchingCoupon.expire_date);

                    if (expireDate < now) {
                        setCouponError("This coupon has expired");
                        setCouponDiscount(0);
                        setAppliedCoupon(null);
                        return;
                    }

                    // Check minimum order amount
                    const minOrderAmount = parseFloat(matchingCoupon.minimum_order_amount) || 0;
                    if (minOrderAmount > 0 && subTotal < minOrderAmount) {
                        setCouponError(`Minimum order amount is ${formatPrice(minOrderAmount)}`);
                        setCouponDiscount(0);
                        setAppliedCoupon(null);
                        return;
                    }

                    // Calculate discount based on coupon_amount_type
                    const couponAmount = parseFloat(matchingCoupon.amount) || 0;
                    const amountLimit = parseFloat(matchingCoupon.amount_limit) || 0;
                    let discount = 0;

                    if (matchingCoupon.coupon_amount_type === "percentage") {
                        discount = Math.round(subTotal * (couponAmount / 100));
                    } else {
                        // fixed amount
                        discount = couponAmount;
                    }

                    // Cap discount by amount_limit if it's set (greater than 0)
                    if (amountLimit > 0 && discount > amountLimit) {
                        discount = amountLimit;
                    }

                    // Don't let discount exceed subtotal
                    discount = Math.min(discount, subTotal);

                    setCouponDiscount(discount);
                    setAppliedCoupon(matchingCoupon);
                    toast.success(`Coupon applied! You saved ${formatPrice(discount)}`);
                } else {
                    setCouponError("Invalid coupon code");
                    setCouponDiscount(0);
                    setAppliedCoupon(null);
                }
            } else {
                setCouponError("Unable to validate coupon");
                setCouponDiscount(0);
                setAppliedCoupon(null);
            }
        } catch (error) {
            console.error("Coupon error:", error);
            setCouponError("Failed to apply coupon");
            setCouponDiscount(0);
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    // Remove applied coupon
    const handleRemoveCoupon = () => {
        setCouponCode("");
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponError("");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDistrict || !selectedCity) {
            toast.error("Please select both District and Area");
            return;
        }

        // Phone number validation for Bangladesh (01[3-9]XXXXXXXX)
        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error("Please enter a valid 11-digit Bangladeshi phone number");
            return;
        }

        setIsSubmitting(true);

        // Save details to Local Storage for future autofill
        try {
            const detailsToSave = {
                firstName: formData.firstName,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                district: selectedDistrict,
                city: selectedCity
            };
            localStorage.setItem("brandEmpireCheckoutDetails", JSON.stringify(detailsToSave));
        } catch (error) {
            console.error("Failed to save checkout details to local storage", error);
        }

        // Construct the payload as per user requirements
        const orderPayload = {
            pay_mode: paymentMethod,
            paid_amount: 0,
            user_id: process.env.NEXT_PUBLIC_USER_ID, // Store/Sales ID
            sub_total: subTotal,
            donation: donationAmount,
            vat: 0,
            tax: 0, // Assuming 0 for now
            discount: 0, // Coupon discount if any
            product: cartItems.map((item) => ({
                product_id: item.id,
                qty: item.quantity,
                price: item.price,
                mode: 1, // Assuming fixed mode
                size: item.selectedSize || "Free Size", // Pass size string directly. Fallback if empty.
                sales_id: process.env.NEXT_PUBLIC_USER_ID,
            })),
            delivery_method_id: 1, // Default to Standard Delivery
            delivery_info_id: 1, // Default ID, could be dynamic
            delivery_customer_name: formData.firstName,
            delivery_customer_address: `${selectedDistrict}, ${selectedCity}`, // Using the structured address
            delivery_customer_phone: formData.phone,
            delivery_fee: deliveryFee,
            variants: [],
            imeis: [null], // As per example
            created_at: new Date().toISOString(),
            customer_id: user?.id || null,
            customer_name: formData.firstName,
            customer_phone: formData.phone,
            sales_id: process.env.NEXT_PUBLIC_USER_ID,
            wholeseller_id: 1, // Hardcoded as per request
            status: 1, // Order Received
            delivery_city: selectedCity, // Added for completeness
            delivery_district: selectedDistrict, // Added for completeness
            detailed_address: formData.address, // Sending the text area address too
        };

        // Combine detailed address with the district/city for the main address field if needed
        // But for now, keeping them separate or as keys might be better.
        // The previous format was concatenated string. Let's make sure we send a useful string.
        orderPayload.delivery_customer_address = `${formData.address}, ${selectedCity}, ${selectedDistrict}`;

        try {
            // If a coupon is applied, call the apply-coupon API to track usage
            if (appliedCoupon && couponCode) {
                try {
                    const couponResponse = await applyCoupon(couponCode);
                    if (!couponResponse.success) {
                        console.warn("Coupon tracking failed:", couponResponse.message);
                        // Don't block the order, just log the warning
                    }
                } catch (couponError) {
                    console.warn("Error tracking coupon usage:", couponError);
                    // Don't block the order, continue with checkout
                }
            }

            const response = await saveSalesOrder(orderPayload);

            if (response.success) {
                clearCart();
                toast.success("Order placed successfully!");
                // Redirect to success page with invoice ID from API response
                const invoiceId = response.data?.invoice_id || response.invoice_id || "INV-" + Date.now();
                router.push(`/order-success?invoice=${invoiceId}`);
            } else {
                toast.error("Failed to place order. Please try again.");
                console.error("Order failed:", response);
            }
        } catch (error) {
            console.error("Error submitting order:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
                <div className="text-center">
                    <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                        Your cart is empty
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Add some items to start your checkout.
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-block rounded-md bg-black px-6 py-3 text-white transition hover:bg-gray-800"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="pt-0 lg:pt-8 pb-8 lg:pb-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Complete your order by providing your delivery and payment details.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.5fr_1fr]">
                        {/* Left Column: Forms */}
                        <div className="space-y-8">
                            {/* Delivery Information */}
                            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900">
                                            Delivery Address
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Where should we send your order?
                                        </p>
                                    </div>
                                </div>

                                <form
                                    id="checkout-form"
                                    ref={formRef}
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    required
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                                    placeholder="John Doe"
                                                    style={{ fontSize: '16px' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    required
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                                    placeholder="01XXXXXXXXX"
                                                    style={{ fontSize: '16px' }}
                                                />
                                            </div>
                                            {formData.phone && !/^01[3-9]\d{8}$/.test(formData.phone) && (
                                                <p className="text-xs text-red-500">
                                                    Invalid phone number format.
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                Format: 01XXXXXXXXX (11 digits, starting with 01)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Optional Email Field */}
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Email <span className="text-gray-400 font-normal">(Optional)</span>
                                            </label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                        <polyline points="22,6 12,13 2,6"></polyline>
                                                    </svg>
                                                </div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                                    placeholder="email@example.com"
                                                    style={{ fontSize: '16px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <AddressSelect
                                            selectedDistrict={selectedDistrict}
                                            setSelectedDistrict={setSelectedDistrict}
                                            selectedCity={selectedCity}
                                            setSelectedCity={setSelectedCity}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Detailed Address
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                required
                                                name="address"
                                                rows={3}
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-3 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                                placeholder="Street address, house number, landmarks..."
                                                style={{ fontSize: '16px' }}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </section>

                            {/* Payment Method */}
                            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900">
                                            Payment Method
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Select how you want to pay
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label
                                        className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm transition-all hover:border-black ${paymentMethod === "Cash"
                                            ? "border-black ring-1 ring-black"
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Cash"
                                            className="sr-only"
                                            checked={paymentMethod === "Cash"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="flex flex-1 flex-col">
                                            <span className="flex items-center gap-2 font-medium text-gray-900">
                                                <Truck className="h-4 w-4 text-gray-500" />
                                                Cash on Delivery
                                            </span>
                                            <span className="mt-1 text-xs text-gray-500">
                                                Pay when you receive
                                            </span>
                                        </div>
                                        {paymentMethod === "Cash" && (
                                            <div className="absolute right-4 top-4 text-black">
                                                <div className="h-3 w-3 rounded-full bg-black" />
                                            </div>
                                        )}
                                    </label>

                                    <label className="relative flex cursor-not-allowed rounded-xl border border-gray-100 p-4 opacity-60">
                                        <div className="flex flex-1 flex-col">
                                            <span className="flex items-center gap-2 font-medium text-gray-400">
                                                <CreditCard className="h-4 w-4" />
                                                Online Payment
                                            </span>
                                            <span className="mt-1 text-xs text-gray-400">
                                                Coming soon
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="h-fit space-y-6 lg:sticky lg:top-24">
                            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h2 className="mb-6 font-semibold text-gray-900">
                                    Order Summary
                                </h2>

                                <div className="mb-6 max-h-[300px] space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                                    {cartItems.map((item, index) => (
                                        <div key={`${item.id}-${item.selectedSize || index}`} className="flex gap-4">
                                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className="flex justify-between">
                                                    <h3 className="line-clamp-1 text-sm font-medium text-gray-900">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <p>
                                                        Qty: {item.quantity} · Size: {item.selectedSize}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-6 space-y-3 border-t border-gray-100 pt-4">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Delivery ({
                                            // Show method name nicely
                                            selectedCity ? (selectedCity === "Demra" || selectedCity?.includes("Savar") || selectedDistrict === "Gazipur" || selectedCity?.includes("Keraniganj"))
                                                ? "Special Area"
                                                : selectedDistrict === "Dhaka"
                                                    ? "Inside Dhaka"
                                                    : "Outside Dhaka"
                                                : "Pending"
                                        })</span>
                                        <span>{formatPrice(deliveryFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Discount</span>
                                        <span className="text-red-500">-{formatPrice(couponDiscount)}</span>
                                    </div>
                                    {donationAmount > 0 && (
                                        <div className="flex justify-between text-sm text-[var(--brand-royal-red)] font-medium">
                                            <span>Donation</span>
                                            <span>+{formatPrice(donationAmount)}</span>
                                        </div>
                                    )}
                                    {/* Coupon Input UI */}
                                    <div className="pt-2">
                                        {appliedCoupon ? (
                                            <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-green-700">
                                                        🎉 {couponCode} applied
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleRemoveCoupon}
                                                    className="text-xs text-red-600 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Coupon Code"
                                                    value={couponCode}
                                                    onChange={(e) => {
                                                        setCouponCode(e.target.value.toUpperCase());
                                                        setCouponError("");
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !couponLoading && couponCode.trim()) {
                                                            e.preventDefault();
                                                            handleApplyCoupon();
                                                        }
                                                    }}
                                                    className={`flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none ${couponError
                                                        ? "border-red-300 bg-red-50 focus:border-red-500"
                                                        : "border-gray-200 bg-gray-50 focus:border-black"
                                                        }`}
                                                    style={{ fontSize: '16px' }}
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponLoading}
                                                    className="rounded-md bg-[var(--brand-royal-red)] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                                >
                                                    {couponLoading ? "..." : "Apply"}
                                                </button>
                                            </div>
                                        )}
                                        {couponError && (
                                            <p className="mt-1 text-xs text-red-600">{couponError}</p>
                                        )}
                                    </div>

                                    {/* Discount Line */}
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Coupon Discount</span>
                                            <span>-{formatPrice(couponDiscount)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Donation Section */}
                                <div className="mb-6 rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 bg-red-50 rounded-full text-[var(--brand-royal-red)] shadow-sm">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm">Donation</h3>
                                            <p className="text-xs text-gray-500">Your donated money will be distributed among the poor and needy.</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {[0, 10, 20, 30, 50].map((amount) => (
                                            <button
                                                type="button"
                                                key={amount}
                                                onClick={() => setDonationAmount(amount)}
                                                className={`px-3 py-1 text-xs rounded-full border transition-all ${donationAmount === amount
                                                    ? "bg-[var(--brand-royal-red)] text-white border-[var(--brand-royal-red)]"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"
                                                    }`}
                                            >
                                                {amount === 0 ? "Tk Not now" : `Tk ${amount}`}
                                            </button>
                                        ))}
                                    </div>

                                    <input
                                        type="number"
                                        placeholder="Enter custom amount"
                                        value={donationAmount > 0 ? donationAmount : ''}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setDonationAmount(isNaN(val) ? 0 : val);
                                        }}
                                        className="w-full text-xs rounded-full border border-gray-200 px-4 py-2 focus:outline-none focus:border-[var(--brand-royal-red)]"
                                    />
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="text-base font-bold text-gray-900">
                                        Grand Total
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {formatPrice(grandTotal)}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={isSubmitting}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-royal-red)] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:opacity-90 hover:translate-y-[-1px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            Complete Order
                                            <Truck className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <Shield className="h-3 w-3" />
                                    Secure checkout powered by SSL encryption
                                </div>
                            </section>

                            <div className="flex justify-center items-center gap-6 mt-8">
                                {/* Delivery Partner Logos (Inline SVG for reliability) */}
                                {/* Pathao Logo */}
                                <svg viewBox="0 0 120 30" className="h-7 w-auto opacity-70 grayscale transition hover:grayscale-0 hover:opacity-100">
                                    <text x="0" y="20" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="24" fill="#E11220">Pathao</text>
                                </svg>

                                {/* FedEx Logo */}
                                <svg viewBox="0 0 110 30" className="h-7 w-auto opacity-70 grayscale transition hover:grayscale-0 hover:opacity-100">
                                    <text x="0" y="20" fontFamily="sans-serif" fontWeight="900" fontSize="24" fill="#4D148C">Fed</text>
                                    <text x="42" y="20" fontFamily="sans-serif" fontWeight="900" fontSize="24" fill="#FF6600">Ex</text>
                                </svg>

                                {/* DHL Logo */}
                                <svg viewBox="0 0 80 30" className="h-7 w-auto opacity-70 grayscale transition hover:grayscale-0 hover:opacity-100">
                                    <rect width="60" height="24" fill="#FFCC00" rx="2" className="hidden" /> {/* Optional background */}
                                    <text x="0" y="20" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="26" fill="#D40511">DHL</text>
                                </svg>
                            </div>

                            <div className="text-center text-xs text-gray-400">
                                <Link href="/terms" className="hover:underline">Terms</Link> · <Link href="/privacy" className="hover:underline">Privacy</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
