"use client";

import React from "react";
import { Truck, Clock, MapPin, AlertCircle } from "lucide-react";

export default function ShippingInfo() {
    return (
        <div className="section-full py-12 md:py-20 bg-gray-50/50">
            <div className="section-content max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Shipping Information</h1>
                    <p className="text-gray-600">Fast and reliable delivery across Bangladesh.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
                    <div className="p-8 md:p-10 border-b border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-50 text-[var(--brand-royal-red)] rounded-full">
                                <Truck size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Delivery Charges & Times</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700 text-sm uppercase tracking-wide">
                                        <th className="p-4 rounded-tl-lg border-b border-gray-200">Location</th>
                                        <th className="p-4 border-b border-gray-200">Delivery Charge</th>
                                        <th className="p-4 rounded-tr-lg border-b border-gray-200">Estimated Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm md:text-base">
                                    <tr className="border-b border-gray-100">
                                        <td className="p-4 font-medium text-gray-900">Inside Dhaka (Metro)</td>
                                        <td className="p-4">৳ 60</td>
                                        <td className="p-4">1 - 3 Days</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="p-4 font-medium text-gray-900">Dhaka Suburbs (Savar, Gazipur, etc.)</td>
                                        <td className="p-4">৳ 100</td>
                                        <td className="p-4">2 - 4 Days</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium text-gray-900">Outside Dhaka (Whole Bangladesh)</td>
                                        <td className="p-4">৳ 130</td>
                                        <td className="p-4">3 - 5 Days</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-1">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Order Processing</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Orders placed before 4:00 PM are processed the same day. Orders placed after that or on holidays will be processed the next business day.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg mt-1">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Tracking Your Order</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Once your order is shipped, you will receive an SMS/Email with a tracking ID. You can track your package on our website's <a href="/track-order" className="text-[var(--brand-royal-red)] hover:underline">Track Order</a> page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex gap-4 items-start">
                    <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-orange-800">
                        <strong>Important Note:</strong> Delivery times may vary depending on the courier partner's load and unforeseen circumstances like bad weather or political unrest. We always aim to deliver as fast as possible.
                    </div>
                </div>

                {/* Partners logos */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm mb-4 uppercase tracking-widest font-semibold">Our Delivery Partners</p>
                    <div className="flex justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Inline SVGs for partners (reused from checkout to be consistent) */}
                        <svg viewBox="0 0 80 24" className="h-6 md:h-8 w-auto">
                            <text x="0" y="20" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="24" fill="#E11220">Pathao</text>
                        </svg>
                        <svg viewBox="0 0 80 24" className="h-6 md:h-8 w-auto">
                            <text x="0" y="20" fontFamily="sans-serif" fontWeight="900" fontSize="24" fill="#4D148C">Fed</text>
                            <text x="42" y="20" fontFamily="sans-serif" fontWeight="900" fontSize="24" fill="#FF6600">Ex</text>
                        </svg>
                        <svg viewBox="0 0 60 24" className="h-6 md:h-8 w-auto">
                            <rect width="60" height="24" fill="#FFCC00" rx="2" className="hidden" />
                            <text x="0" y="20" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="26" fill="#D40511">DHL</text>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
