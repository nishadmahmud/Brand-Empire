"use client";

import React from "react";
import { RefreshCcw, CheckCircle, XCircle, Mail } from "lucide-react";

export default function Returns() {
    return (
        <div className="section-full py-12 md:py-20 bg-gray-50/50">
            <div className="section-content max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Returns & Exchange</h1>
                    <p className="text-gray-600">Hassle-free 7-day return policy.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <RefreshCcw className="text-[var(--brand-royal-red)]" />
                        Our Policy
                    </h2>
                    <div className="prose text-gray-600 max-w-none">
                        <p className="mb-4">
                            At Brand Empire, we ensure that you receive exactly what you ordered in top-notch condition. However, if you are not satisfied with your purchase, you can return or exchange the item within <strong>7 days</strong> of delivery.
                        </p>
                        <p>
                            To be eligible for a return, your item must be unused, unwashed, and in the same condition that you received it. It must also be in the original packaging with all tags intact.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-8">
                        <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                            <CheckCircle size={20} /> Returnable Items
                        </h3>
                        <ul className="space-y-2 text-green-900 text-sm">
                            <li className="flex gap-2"><span>•</span> Apparel with manufacturing defects</li>
                            <li className="flex gap-2"><span>•</span> Wrong size/color delivered</li>
                            <li className="flex gap-2"><span>•</span> Damaged packaging upon arrival</li>
                            <li className="flex gap-2"><span>•</span> Unworn shoes in original box</li>
                        </ul>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-8">
                        <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                            <XCircle size={20} /> Non-Returnable Items
                        </h3>
                        <ul className="space-y-2 text-red-900 text-sm">
                            <li className="flex gap-2"><span>•</span> Innerwear & Lingerie (Hygiene reasons)</li>
                            <li className="flex gap-2"><span>•</span> Socks & Stockings</li>
                            <li className="flex gap-2"><span>•</span> Used or washed items</li>
                            <li className="flex gap-2"><span>•</span> Accessories like earrings</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">How to initiate a return?</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Contact Support</h4>
                                <p className="text-sm text-gray-600 mt-1">Email us at <a href="mailto:returns@brandempire.com" className="text-[var(--brand-royal-red)] hover:underline">returns@brandempire.com</a> or call our helpline within 7 days.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Pack the Item</h4>
                                <p className="text-sm text-gray-600 mt-1">Place the item in the original package formatted with tags intact.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Pickup / Drop-off</h4>
                                <p className="text-sm text-gray-600 mt-1">Our delivery partner will pick up the item from your location (Metro areas) or you may need to ship it to our address.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold flex-shrink-0">4</div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Refund/Exchange</h4>
                                <p className="text-sm text-gray-600 mt-1">After quality check, your refund or exchange will be processed within 5-7 business days.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
