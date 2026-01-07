"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const AuthModal = () => {
    const { authModalOpen, authModalMode, closeAuthModal, setAuthModalMode, login, register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form states
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    // Reset state when modal opens/closes or mode changes
    useEffect(() => {
        if (!authModalOpen) {
            // Reset forms and errors when closed
            setLoginData({ email: "", password: "" });
            setRegisterData({
                first_name: "",
                last_name: "",
                phone: "",
                email: "",
                password: "",
                confirm_password: "",
            });
            setError("");
        }
    }, [authModalOpen]);

    useEffect(() => {
        // Clear error when switching modes
        setError("");
    }, [authModalMode]);

    // Handlers
    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const result = await login(loginData.email, loginData.password);
        setLoading(false);
        if (!result.success) {
            setError(result.message);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (registerData.password !== registerData.confirm_password) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const { confirm_password, ...dataToSend } = registerData;
        const result = await register(dataToSend);
        setLoading(false);
        if (!result.success) {
            setError(result.message);
        }
    };

    if (!authModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={closeAuthModal}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Header / Tabs */}
                <div className="pt-8 px-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {authModalMode === 'login' ? 'Log In to your Account' : 'Create an Account'}
                    </h2>

                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`flex-1 pb-3 text-sm font-medium transition-all relative ${authModalMode === 'login' ? 'text-[var(--brand-royal-red)]' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setAuthModalMode('login')}
                        >
                            Login
                            {authModalMode === 'login' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-royal-red)] rounded-t-full"></span>
                            )}
                        </button>
                        <button
                            className={`flex-1 pb-3 text-sm font-medium transition-all relative ${authModalMode === 'register' ? 'text-[var(--brand-royal-red)]' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setAuthModalMode('register')}
                        >
                            Register
                            {authModalMode === 'register' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-royal-red)] rounded-t-full"></span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 pb-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {authModalMode === 'login' ? (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)]/20 focus:border-[var(--brand-royal-red)] transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)]/20 focus:border-[var(--brand-royal-red)] transition-all text-sm"
                                />
                                <div className="flex justify-end mt-1">
                                    <button type="button" className="text-xs text-gray-500 hover:text-[var(--brand-royal-red)]">
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-[var(--brand-royal-red)] text-white font-bold rounded-lg shadow-lg shadow-[var(--brand-royal-red)]/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </span>
                                ) : "Continue"}
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setAuthModalMode('register')}
                                        className="font-bold text-[var(--brand-royal-red)] hover:underline"
                                    >
                                        Register Now
                                    </button>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={registerData.first_name}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="John"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)]/20 focus:border-[var(--brand-royal-red)] transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={registerData.last_name}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="Doe"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)]/20 focus:border-[var(--brand-royal-red)] transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)]/20 focus:border-[var(--brand-royal-red)] transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Phone</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm">
                                        +88
                                    </span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={registerData.phone}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="01712345678"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)]/20 focus:border-[var(--brand-royal-red)] transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)]/20 focus:border-[var(--brand-royal-red)] transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={registerData.confirm_password}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal-red)]/20 focus:border-[var(--brand-royal-red)] transition-all text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-[var(--brand-royal-red)] text-white font-bold rounded-lg shadow-lg shadow-[var(--brand-royal-red)]/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : "Register"}
                            </button>

                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setAuthModalMode('login')}
                                        className="font-bold text-[var(--brand-royal-red)] hover:underline"
                                    >
                                        Log In
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* Social Login Placeholder (as per reference img, though implementation logic not yet present) */}
                    {/* 
                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs text-gray-400 uppercase font-medium">Or Login with</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    <div className="mt-4 flex justify-center gap-4">
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <img src="/icons/facebook.svg" alt="Facebook" className="w-5 h-5" />
                        </button>
                    </div> 
                    */}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
