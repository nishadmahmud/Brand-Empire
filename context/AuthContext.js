"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { customerLogin, customerRegister, updateCustomerProfile } from "@/lib/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load user/token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("customer");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await customerLogin(email, password);
            // const data = await customerLogin(email, password); // Removing duplicate
            if (data.token) {
                setToken(data.token);
                setUser(data.customer);

                localStorage.setItem("token", data.token);
                localStorage.setItem("customer", JSON.stringify(data.customer));
                return { success: true };
            } else {
                return { success: false, message: data.message || "Invalid credentials" };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "An error occurred during login." };
        }
    };

    const register = async (userData) => {
        try {
            const data = await customerRegister(userData);
            if (data.success) {
                // If registration returns a token/user immediately, log them in
                // Based on API spec, it returns "customer" object.
                // It MIGHT not return a token immediately based on the provided spec example (just says "Registration successful" and customer obj).
                // If no token, we might need to ask them to login or auto-login.
                // Assuming for now we might need to auto-login separately or if the backend sends token (often they do).
                // Spec says response success has "customer" but doesn't explicitly show "token" in the example response.
                // Let's assume we redirect to login or auto-login if token is present.

                if (data.token) {
                    setToken(data.token);
                    setUser(data.customer);
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("customer", JSON.stringify(data.customer));
                    return { success: true };
                }

                return { success: true, message: "Registration successful! Please login." };
            } else {
                return { success: false, message: data.message || "Registration failed" };
            }
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: "An error occurred during registration." };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const data = await updateCustomerProfile(token, profileData);
            if (data.success) {
                // Update local state and storage
                const updatedCustomer = data.data || data.customer;
                const updatedUser = { ...user, ...updatedCustomer };
                setUser(updatedUser);
                localStorage.setItem("customer", JSON.stringify(updatedUser));
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || "Profile update failed" };
            }
        } catch (error) {
            console.error("Profile update error:", error);
            return { success: false, message: "An error occurred during profile update." };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("customer");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
