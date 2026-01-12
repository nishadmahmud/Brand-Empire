"use client";

import React, { useState } from "react";
import { Copy, X } from "lucide-react";
import toast from "react-hot-toast";

const FloatingIconsMobile = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const couponCode = "OFF500";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(couponCode);
            setIsCopied(true);
            toast.success("Coupon code copied to clipboard!");
            setTimeout(() => {
                setIsCopied(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to copy:", error);
            toast.error("Failed to copy coupon code");
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setIsCopied(false);
    };

    return (
        <>
            {/* Backdrop overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={handleClose}
                />
            )}

            {/* MOBILE ONLY - Top Right Position */}
            <div className="fixed right-0 z-60 flex items-center" style={{ top: '106px' }}>
                {/* Expanded Content */}
                <div
                    className={`bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "w-[280px] opacity-100 mr-0" : "w-0 opacity-0 -mr-4"
                    } rounded-l-lg border border-gray-100 flex flex-col max-h-full`}
                >
                    <div className="bg-gradient-to-r from-pink-100 to-orange-100 p-4 relative overflow-y-auto">
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-10"
                        >
                            <X size={18} />
                        </button>

                        <div className="mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Limited Time Offer
                        </div>
                        <div className="text-2xl font-extrabold text-gray-800 mb-1">
                            FLAT <span className="text-[var(--brand-royal-red)]">500 OFF</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">On your first order above ৳2000</p>

                        <div className="bg-white border-2 border-dashed border-gray-300 rounded p-2 flex flex-col items-center justify-center mb-3">
                            <span className="text-[10px] text-gray-400 mb-1">Coupon Code</span>
                            <div className="text-lg font-bold font-mono tracking-wider text-gray-800">
                                {couponCode}
                            </div>
                        </div>

                        <button
                            onClick={handleCopy}
                            className={`w-full py-2 font-bold rounded transition flex items-center justify-center gap-2 text-xs ${
                                isCopied
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-[var(--brand-royal-red)] text-white hover:bg-red-700'
                            }`}
                        >
                            {isCopied ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    COPIED
                                </>
                            ) : (
                                <>
                                    <Copy size={14} />
                                    COPY CODE
                                </>
                            )}
                        </button>
                    </div>

                    <div className="p-2 bg-gray-50 text-[9px] text-gray-500 text-center">
                        Genuine Products • Easy Returns • Secure Payment
                    </div>
                </div>

                {/* Vertical Tab */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`bg-[#3E4152] text-white flex flex-col items-center justify-center py-3 px-1.5 rounded-l-md shadow-lg transition-transform duration-300 hover:bg-gray-800 ${
                        isOpen ? "opacity-0 pointer-events-none absolute" : "opacity-100"
                    }`}
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    <div className="transform rotate-180 flex items-center gap-1.5">
                        <span className="font-bold text-xs tracking-wider whitespace-nowrap">
                            FLAT ৳500 OFF
                        </span>
                        <span className="w-1.5 h-1.5 border-t-2 border-r-2 border-white transform rotate-[135deg] mt-0.5"></span>
                    </div>
                </button>
            </div>
        </>
    );
};

export default FloatingIconsMobile;
