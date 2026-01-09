"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import Image from 'next/image';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((product) => {
        setToast(product);
        // Auto-hide after 3 seconds
        setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-32 right-6 z-[200] animate-slideInRight">
                    <div className="bg-[#2d3436] text-white rounded-lg shadow-2xl flex items-center gap-3 px-4 py-3 min-w-[300px]">
                        {/* Product Image */}
                        <div className="w-12 h-12 bg-white rounded flex-shrink-0 overflow-hidden">
                            <Image
                                src={toast.images?.[0] || '/api/placeholder/48/48'}
                                alt={toast.name || "Product Image"}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                                unoptimized
                            />
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                            <p className="font-bold text-sm">Added to bag</p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={hideToast}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.3s ease-out;
                }
            `}</style>
        </ToastContext.Provider>
    );
};
