"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCustomerOrders, updateCustomerPassword } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TABS = [
    {
        id: "1", label: "Order Processing", icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        id: "2", label: "Order Completed", icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        id: "3", label: "Delivery Processing", icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        id: "4", label: "Delivery Completed", icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        )
    },
    {
        id: "5", label: "Delivery Canceled", icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
];

export default function ProfilePage() {
    const { user, logout, loading, updateProfile, token } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("1"); // Default to Order Processing

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        address: ""
    });
    const [updateStatus, setUpdateStatus] = useState({ message: "", type: "" });
    const [isUpdating, setIsUpdating] = useState(false);

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
    });
    const [passwordStatus, setPasswordStatus] = useState({ message: "", type: "" });
    const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);


    useEffect(() => {
        const fetchOrders = async () => {
            if (user && token) {
                setOrdersLoading(true);
                try {
                    const customerId = user.id || user.customer_id;
                    const data = await getCustomerOrders(token, customerId, activeTab);
                    if (data.success) {
                        if (Array.isArray(data.data)) {
                            setOrders(data.data);
                        } else if (data.data && Array.isArray(data.data.data)) {
                            setOrders(data.data.data);
                        } else {
                            setOrders([]);
                        }
                    } else {
                        setOrders([]);
                    }
                } catch (err) {
                    console.error("Failed to fetch orders", err);
                    setOrders([]);
                } finally {
                    setOrdersLoading(false);
                }
            }
        };

        if (user && token) {
            fetchOrders();
        }
    }, [user, token, activeTab]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            // Split name if first/last name not explicit
            let first = user.first_name || "";
            let last = user.last_name || "";
            if (!first && user.name) {
                const parts = user.name.split(" ");
                first = parts[0];
                last = parts.slice(1).join(" ");
            }

            setFormData({
                id: user.id || user.customer_id,
                first_name: first,
                last_name: last,
                email: user.email || "",
                mobile_number: user.mobile_number || user.phone || "",
                address: user.address || ""
            });
        }
    }, [user, loading, router]);


    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateStatus({ message: "", type: "" });

        const result = await updateProfile(formData);

        if (result.success) {
            setUpdateStatus({ message: "Profile updated successfully!", type: "success" });
            setIsEditing(false);
        } else {
            setUpdateStatus({ message: result.message || "Failed to update profile.", type: "error" });
        }
        setIsUpdating(false);
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setIsPasswordUpdating(true);
        setPasswordStatus({ message: "", type: "" });

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setPasswordStatus({ message: "New passwords do not match.", type: "error" });
            setIsPasswordUpdating(false);
            return;
        }

        try {
            const data = await updateCustomerPassword(token, {
                email: user.email,
                ...passwordData
            });

            if (data.success) {
                setPasswordStatus({ message: data.message || "Password updated successfully!", type: "success" });
                setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
            } else {
                setPasswordStatus({ message: data.message || "Failed to update password.", type: "error" });
            }
        } catch (error) {
            setPasswordStatus({ message: "An error occurred.", type: "error" });
        } finally {
            setIsPasswordUpdating(false);
        }
    };

    if (loading || !user) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                My Profile {isEditing && "- Edit Mode"}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Personal details and account settings.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    Cancel
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    Edit Profile
                                </button>
                            )}
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--brand-royal-red)] hover:bg-red-700 focus:outline-none"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {updateStatus.message && (
                        <div className={`px-4 py-3 mb-2 ${updateStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {updateStatus.message}
                        </div>
                    )}

                    <div className="border-t border-gray-200">
                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="px-4 py-5 sm:px-6 space-y-4">
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                            First name
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="first_name"
                                                id="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-[var(--brand-royal-red)] focus:border-[var(--brand-royal-red)] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                            Last name
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="last_name"
                                                id="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-[var(--brand-royal-red)] focus:border-[var(--brand-royal-red)] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email address
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-[var(--brand-royal-red)] focus:border-[var(--brand-royal-red)] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">
                                            Mobile Number
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="mobile_number"
                                                id="mobile_number"
                                                value={formData.mobile_number}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-[var(--brand-royal-red)] focus:border-[var(--brand-royal-red)] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                            Address
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="address"
                                                name="address"
                                                rows={3}
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-[var(--brand-royal-red)] focus:border-[var(--brand-royal-red)] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--brand-royal-red)] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-royal-red)] disabled:opacity-50"
                                    >
                                        {isUpdating ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <dl>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Full name
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.name || "N/A"}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Email address
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {user.email || "N/A"}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Phone number
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {user.mobile_number || user.phone || "N/A"}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Address
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {user.address || "No address provided"}
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Change Password
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Update your account password.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsPasswordExpanded(!isPasswordExpanded)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            {isPasswordExpanded ? "Cancel" : "Update Password"}
                        </button>
                    </div>
                    {isPasswordExpanded && (
                        <>
                            {passwordStatus.message && (
                                <div className={`px-4 py-3 mb-2 ${passwordStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {passwordStatus.message}
                                </div>
                            )}
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        <div className="sm:col-span-2">
                                            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                                                Current Password
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="password"
                                                    name="current_password"
                                                    id="current_password"
                                                    value={passwordData.current_password}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    className="shadow-sm focus:ring-[var(--brand-royal-red)] focus:border-[var(--brand-royal-red)] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                                                New Password
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="password"
                                                    name="new_password"
                                                    id="new_password"
                                                    value={passwordData.new_password}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    className="shadow-sm focus:ring-[var(--brand-royal-red)] focus:border-[var(--brand-royal-red)] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700">
                                                Confirm New Password
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="password"
                                                    name="new_password_confirmation"
                                                    id="new_password_confirmation"
                                                    value={passwordData.new_password_confirmation}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    className="shadow-sm focus:ring-[var(--brand-royal-red)] focus:border-[var(--brand-royal-red)] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isPasswordUpdating}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--brand-royal-red)] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-royal-red)] disabled:opacity-50"
                                        >
                                            {isPasswordUpdating ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </div>

                {/* Tabbed Order History Section */}
                <div className="bg-white shadow sm:rounded-lg">
                    {/* Tabs Header */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex overflow-x-auto" aria-label="Tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${activeTab === tab.id
                                        ? 'border-[var(--brand-royal-red)] text-[var(--brand-royal-red)]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {ordersLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
                            </div>
                        ) : orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Invoice ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.order_id || order.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {order.invoice_no || order.invoice_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {order.date || new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {order.status || order.order_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                    {order.grand_total || order.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-16 w-16 text-gray-300 mb-4 bg-gray-50 rounded-lg p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900">No orders found in this category.</h3>
                                <p className="mt-1 text-sm text-gray-500">Orders will appear here once you make a purchase.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
