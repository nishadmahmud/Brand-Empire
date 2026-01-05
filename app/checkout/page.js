"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { saveSalesOrder } from "../../lib/api";
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
    const { cartItems, getSubtotal, deliveryFee, updateDeliveryFee, clearCart } =
        useCart();
    const { user } = useAuth();
    const router = useRouter();

    const subTotal = getSubtotal();

    // We'll manage district/city separately now
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        phone: "",
        address: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [couponCode, setCouponCode] = useState("");

    const formRef = useRef(null);

    // Prefill form with user data
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                firstName: user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.name || prev.firstName,
                phone: user.phone || prev.phone,
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

    const grandTotal = subTotal + deliveryFee;

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

        // Construct the payload as per user requirements
        const orderPayload = {
            pay_mode: paymentMethod,
            paid_amount: 0,
            user_id: process.env.NEXT_PUBLIC_USER_ID, // Store/Sales ID
            sub_total: subTotal,
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
            status: 3, // Pending status
            delivery_city: selectedCity, // Added for completeness
            delivery_district: selectedDistrict, // Added for completeness
            detailed_address: formData.address, // Sending the text area address too
        };

        // Combine detailed address with the district/city for the main address field if needed
        // But for now, keeping them separate or as keys might be better.
        // The previous format was concatenated string. Let's make sure we send a useful string.
        orderPayload.delivery_customer_address = `${formData.address}, ${selectedCity}, ${selectedDistrict}`;

        try {
            const response = await saveSalesOrder(orderPayload);

            if (response.success) {
                clearCart();
                toast.success("Order placed successfully!");
                // Redirect to success page with invoice ID
                router.push(
                    `/order-success?invoice=${response.invoice_id || "INV-" + Date.now()
                    }`
                );
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
            <div className="pt-24 lg:pt-28 pb-8 lg:pb-12">
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
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Phone Number
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
                                                />
                                            </div>
                                            {formData.phone && !/^01[3-9]\d{8}$/.test(formData.phone) && (
                                                <p className="text-xs text-red-500">
                                                    Invalid phone number format.
                                                </p>
                                            )}
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
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4">
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
                                                        ৳{item.price * item.quantity}
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
                                        <span>৳{subTotal}</span>
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
                                        <span>৳{deliveryFee}</span>
                                    </div>
                                    {/* Coupon Input UI - Placeholder */}
                                    <div className="flex gap-2 pt-2">
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-black focus:outline-none"
                                        />
                                        <button className="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-800">
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="text-base font-bold text-gray-900">
                                        Grand Total
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">
                                        ৳{grandTotal}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={isSubmitting}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:translate-y-[-1px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            Pay ৳{grandTotal}
                                            <Truck className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <Shield className="h-3 w-3" />
                                    Secure checkout powered by SSL encryption
                                </div>
                            </section>

                            <div className="flex justify-center gap-4 opacity-50 grayscale transition hover:grayscale-0">
                                {/* Delivery Partner Logos Placeholders */}
                                <div className="h-8 w-12 rounded bg-gray-200"></div>
                                <div className="h-8 w-12 rounded bg-gray-200"></div>
                                <div className="h-8 w-12 rounded bg-gray-200"></div>
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
