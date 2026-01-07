"use client";

import React, { useState } from "react";
import { Copy, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const FloatingIcons = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { showToast } = useToast();
    const couponCode = "OFF500";

    const handleCopy = () => {
        navigator.clipboard.writeText(couponCode);
        showToast("Coupon code copied to clipboard!", "success");
    };

    return (
        <div
            className="fixed right-0 z-50 flex items-start"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
            {/* Expanded Content (Slide out) */}
            <div
                className={`bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "w-[350px] opacity-100 mr-0" : "w-0 opacity-0 -mr-4"
                    } rounded-l-lg border border-gray-100 flex flex-col`}
            >
                <div className="bg-gradient-to-r from-pink-100 to-orange-100 p-6 relative">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-wide">Limited Time Offer</div>
                    <div className="text-3xl font-extrabold text-gray-800 mb-1">
                        FLAT <span className="text-[var(--brand-royal-red)]">500 OFF</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">On your first order above ৳2000</p>

                    <div className="bg-white border-2 border-dashed border-gray-300 rounded p-3 flex flex-col items-center justify-center mb-4">
                        <span className="text-xs text-gray-400 mb-1">Coupon Code</span>
                        <div className="text-xl font-bold font-mono tracking-wider text-gray-800">{couponCode}</div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="w-full py-2 bg-[var(--brand-royal-red)] text-white font-bold rounded hover:bg-red-700 transition w-full flex items-center justify-center gap-2"
                    >
                        <Copy size={16} />
                        COPY CODE
                    </button>
                </div>

                <div className="p-3 bg-gray-50 text-[10px] text-gray-500 text-center">
                    Genuine Products • Easy Returns • Secure Payment
                </div>
            </div>

            {/* Vertical Tab (Collapsed) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-[#3E4152] text-white flex flex-col items-center justify-center py-4 px-2 rounded-l-md shadow-lg transition-transform duration-300 hover:bg-gray-800 ${isOpen ? "opacity-0 pointer-events-none absolute" : "opacity-100"
                    }`}
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
                <div className="transform rotate-180 flex items-center gap-2">
                    <span className="font-bold text-sm tracking-wider whitespace-nowrap">FLAT ৳500 OFF</span>
                    <span className="w-2 h-2 border-t-2 border-r-2 border-white transform rotate-[135deg] mt-1"></span>
                </div>
            </button>
        </div>
    );
};

export default FloatingIcons;
