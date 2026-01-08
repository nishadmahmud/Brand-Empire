"use client";

import { useState } from "react";
import { trackOrder } from "../../lib/api";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, Calendar, DollarSign, MapPin, Truck } from "lucide-react";
import toast from "react-hot-toast";

export default function TrackOrderPage() {
    const [formData, setFormData] = useState({
        invoice_id: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.invoice_id) {
            toast.error("Please enter Invoice ID");
            return;
        }

        setIsLoading(true);
        setOrderData(null);
        setHasSearched(true);

        try {
            const response = await trackOrder(formData);

            // Based on user provided JSON: response.data.data is an array. We take the first item.
            if (response.success && response.data && response.data.data && response.data.data.length > 0) {
                setOrderData(response.data.data[0]);
                toast.success("Order details found!");
            } else {
                toast.error("Order not found. Please check your Invoice ID.");
                setOrderData(null);
            }
        } catch (error) {
            console.error("Error tracking order:", error);
            toast.error("Something went wrong. Please try again.");
            setOrderData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    };

    // Helper for status badge color
    // Mapping numeric status from API if needed, or string
    const getStatusLabel = (status) => {
        switch (Number(status)) {
            case 1: return "Order Received";
            case 2: return "Order Completed";
            case 3: return "Delivery Processing";
            case 4: return "Delivered";
            case 5: return "Canceled";
            case 6: return "Hold";
            default: return "Pending";
        }
    };

    const getStatusColor = (status) => {
        const s = Number(status);
        if (s === 1) return "bg-blue-50 text-blue-700 border-blue-100";
        if (s === 2) return "bg-green-50 text-green-700 border-green-100";
        if (s === 3) return "bg-purple-50 text-purple-700 border-purple-100";
        if (s === 4) return "bg-teal-50 text-teal-700 border-teal-100";
        if (s === 5) return "bg-red-50 text-red-700 border-red-100";
        if (s === 6) return "bg-orange-50 text-orange-700 border-orange-100";
        return "bg-gray-100 text-gray-800";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 pt-4 md:pt-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Track Your Order
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Enter your invoice ID to see the current status of your order.
                        </p>
                    </div>

                    {/* Tracking Form */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 mb-8 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Invoice ID
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="invoice_id"
                                        value={formData.invoice_id}
                                        onChange={handleChange}
                                        placeholder="INV-2024-XXX"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--brand-royal-red)] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-royal-red)] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? "Searching..." : "Track Order"}
                            </button>
                        </form>
                    </div>

                    {/* Results Section */}
                    {orderData ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Order Data
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ID: <span className="font-mono font-medium text-gray-900">{orderData.invoice_id}</span>
                                    </p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(orderData.status)}`}>
                                    {getStatusLabel(orderData.status)}
                                </span>
                            </div>

                            <div className="p-6 sm:p-8 space-y-8">
                                {/* Order Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Order Date</p>
                                                <p className="text-sm text-gray-500">{formatDate(orderData.created_at)}</p>
                                            </div>
                                        </div>
                                        {orderData.delivery_customer_name && (
                                            <div className="flex items-start gap-4">
                                                <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
                                                    <Truck className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Customer</p>
                                                    <p className="text-sm text-gray-500">
                                                        {orderData.delivery_customer_name}
                                                        <br />
                                                        {orderData.delivery_customer_phone}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                                                <p className="text-sm text-gray-500">{orderData.delivery_customer_address}</p>
                                                {orderData.delivery_district && (
                                                    <p className="text-xs text-gray-400 mt-1">{orderData.delivery_district}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="bg-orange-50 p-2.5 rounded-lg text-orange-600">
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Total Amount</p>
                                                <p className="text-lg font-bold text-gray-900">৳{orderData.total || orderData.sub_total || orderData.paid_amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Products List */}
                                <div>
                                    <h3 className="text-sm font-body font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                        Order Items
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Using sales_details for product list as per new json */}
                                        {orderData.sales_details?.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 py-2">
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 relative">
                                                    {item.product_info?.image_path ? (
                                                        <Image
                                                            src={item.product_info.image_path}
                                                            alt={item.product_info.name || "Product"}
                                                            fill
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.product_info?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {item.qty} {item.size ? `· Size: ${item.size}` : ""}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    ৳{item.price * item.qty}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : hasSearched && !isLoading ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                                <Search className="h-full w-full" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Order Found</h3>
                            <p className="mt-1 text-sm text-gray-500">Could not find an order with that Invoice ID.</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
