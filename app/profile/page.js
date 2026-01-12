"use client";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCustomerOrders, getCustomerCoupons, getCouponList, collectCoupon, trackOrder, uploadSingleFile } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Home, Package, Heart, Tag, User, LogOut, ChevronDown, Clock, CheckCircle, Truck, PackageCheck, XCircle } from "lucide-react";


const ORDER_TABS = [
    { id: "1", label: "Order Processing", Icon: Clock },
    { id: "2", label: "Order Completed", Icon: CheckCircle },
    { id: "3", label: "Delivery Processing", Icon: Truck },
    { id: "4", label: "Delivery Completed", Icon: PackageCheck },
    { id: "5", label: "Delivery Canceled", Icon: XCircle },
];

export default function ProfileDashboard() {
    const { user, logout, loading, token, updateProfile } = useAuth();
    const { wishlist } = useWishlist();
    const router = useRouter();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [ordersExpanded, setOrdersExpanded] = useState(true);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [activeOrderTab, setActiveOrderTab] = useState("1");
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [couponsLoading, setCouponsLoading] = useState(false);

    // Profile editing states
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        address: ""
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);

    // Track order states
    const [trackInvoiceId, setTrackInvoiceId] = useState("");
    const [trackOrderData, setTrackOrderData] = useState(null);
    const [trackLoading, setTrackLoading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        } else if (user) {
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

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            let imageUrl = user?.image || null;


            // Step 1: Upload profile image if selected
            if (profileImage) {
                setImageUploading(true);
                const imageFormData = new FormData();
                imageFormData.append("file_name", profileImage);
                imageFormData.append("user_id", String(process.env.NEXT_PUBLIC_USER_ID));

                const uploadRes = await uploadSingleFile(imageFormData, token);

                if (uploadRes?.success && uploadRes?.path) {
                    imageUrl = uploadRes.path;
                } else {
                    toast.error("Failed to upload image. Please try again.");
                    setIsUpdating(false);
                    setImageUploading(false);
                    return;
                }
                setImageUploading(false);
            }

            // Step 2: Update profile with image URL
            const profileData = {
                id: formData.id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.mobile_number, // Backend requires 'phone' key
                address: formData.address,
                image: imageUrl
            };

            const result = await updateProfile(profileData);
            if (result.success) {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
                setProfileImage(null);
                setProfileImagePreview(null);
            } else {
                toast.error(result.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Something went wrong");
        } finally {
            setIsUpdating(false);
            setImageUploading(false);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !token || activeSection !== "orders") return;

            setOrdersLoading(true);
            try {
                const customerId = user.id || user.customer_id;
                const data = await getCustomerOrders(token, customerId, activeOrderTab);

                if (data.success) {
                    const orderList = data.data?.data || data.data || [];
                    setOrders(Array.isArray(orderList) ? orderList : []);
                } else {
                    setOrders([]);
                }
            } catch (err) {
                console.error("Failed to fetch orders", err);
                setOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchOrders();
    }, [user, token, activeSection, activeOrderTab]);

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!user || activeSection !== "coupons") return;

            setCouponsLoading(true);
            try {
                const customerId = user.id || user.customer_id;
                const data = await getCustomerCoupons(customerId);

                if (data.success && data.data) {
                    setCoupons(Array.isArray(data.data) ? data.data : []);
                } else {
                    setCoupons([]);
                }
            } catch (err) {
                console.error("Failed to fetch coupons", err);
                setCoupons([]);
            } finally {
                setCouponsLoading(false);
            }
        };

        fetchCoupons();
    }, [user, activeSection]);

    const handleTrackOrder = async (e) => {
        e.preventDefault();
        if (!trackInvoiceId.trim()) {
            toast.error("Please enter Invoice ID");
            return;
        }

        setTrackLoading(true);
        setTrackOrderData(null);

        try {
            const response = await trackOrder({ invoice_id: trackInvoiceId });
            if (response.success && response.data?.data && response.data.data.length > 0) {
                setTrackOrderData(response.data.data[0]);
                toast.success("Order found!");
            } else {
                toast.error("Order not found");
                setTrackOrderData(null);
            }
        } catch (error) {
            console.error("Error tracking order:", error);
            toast.error("Something went wrong");
            setTrackOrderData(null);
        } finally {
            setTrackLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = { 1: "Order Processing", 2: "Order Completed", 3: "Delivery Processing", 4: "Delivered", 5: "Canceled" };
        return labels[Number(status)] || "Pending";
    };

    const getStatusColor = (status) => {
        const colors = {
            1: "border-blue-100 text-blue-700 bg-blue-50",
            2: "border-green-100 text-green-700 bg-green-50",
            3: "border-purple-100 text-purple-700 bg-purple-50",
            4: "border-teal-100 text-teal-700 bg-teal-50",
            5: "border-red-100 text-red-700 bg-red-50",
        };
        return colors[Number(status)] || "border-gray-200 text-gray-700 bg-gray-50";
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
            </div>
        );
    }

    const userName = user.first_name || user.name?.split(" ")[0] || "User";

    return (
        <div className="min-h-screen bg-gray-50 pt-4 md:pt-6">
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-6">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                    <span className="font-medium text-sm">Menu</span>
                </button>

                <div className="flex gap-6 items-start">
                    {/* Sidebar - Hidden on mobile, overlay when opened */}
                    <aside className={`
                        fixed lg:static
                        top-0 lg:top-auto left-0 lg:left-auto
                        w-64
                        bg-white
                        z-50 lg:z-auto
                        transform lg:transform-none transition-transform duration-300
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        lg:block
                        flex-shrink-0
                        h-screen lg:h-auto
                    `}>
                        <div className="bg-white lg:rounded-xl shadow-sm border lg:sticky lg:top-24 h-full lg:h-auto flex flex-col">
                            {/* Mobile Close Button */}
                            <div className="lg:hidden flex items-center justify-between p-4 border-b flex-shrink-0">
                                <span className="font-semibold text-gray-900">Menu</span>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>


                            <div className="p-6 border-b hidden lg:block">
                                <Link href="/" className="flex items-center">
                                    <div className="relative h-10 w-32">
                                        <Image src="/logo.png" alt="Brand Empire" fill className="object-contain" unoptimized />
                                    </div>
                                </Link>
                            </div>

                            <nav className="p-4 flex-1 overflow-y-auto pb-20 lg:pb-4">
                                {/* Overview - Active indicator */}
                                <button onClick={() => { setActiveSection("dashboard"); setSidebarOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors ${activeSection === "dashboard" ? "text-[var(--brand-royal-red)]" : "text-gray-700 hover:text-[var(--brand-royal-red)]"}`}>
                                    Overview
                                </button>

                                {/* ORDERS Section */}
                                <div className="mt-6">
                                    <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Orders</p>
                                    <button onClick={() => { setActiveSection("orders"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === "orders" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        Orders & Returns
                                    </button>
                                    <button onClick={() => { setActiveSection("tracking"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === "tracking" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        Track Order
                                    </button>
                                </div>

                                {/* CREDITS Section */}
                                <div className="mt-6">
                                    <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Credits</p>
                                    <button onClick={() => { setActiveSection("coupons"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === "coupons" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        Coupons
                                    </button>
                                    <button onClick={() => { setActiveSection("benefits"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === "benefits" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        My Points
                                    </button>
                                </div>

                                {/* ACCOUNT Section */}
                                <div className="mt-6">
                                    <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
                                    <button onClick={() => { setActiveSection("profile"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === "profile" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        Profile
                                    </button>
                                    <button onClick={() => { setActiveSection("wishlist"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${activeSection === "wishlist" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        Wishlist
                                        {wishlist.length > 0 && <span className="bg-[var(--brand-royal-red)] text-white text-[10px] px-1.5 py-0.5 rounded-full">{wishlist.length}</span>}
                                    </button>
                                    <button onClick={() => { setActiveSection("addresses"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === "addresses" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        Addresses
                                    </button>
                                </div>

                                {/* LEGAL Section */}
                                <div className="mt-6">
                                    <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Legal</p>
                                    <button onClick={() => { setActiveSection("terms"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === "terms" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        Terms of Use
                                    </button>
                                    <button onClick={() => { setActiveSection("privacy"); setSidebarOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeSection === "privacy" ? "text-[var(--brand-royal-red)] font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                                        Privacy Center
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="mt-6 pt-4 border-t">
                                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
                                        Logout
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area - Full width on mobile */}
                    <div className="flex-1 w-full lg:w-auto min-w-0">
                        {/* Dashboard / Overview */}
                        {activeSection === "dashboard" && (
                            <>
                                {/* User Profile Header */}
                                <div className="bg-white rounded-lg border p-3 md:p-6 mb-4 md:mb-6 flex items-center gap-3 md:gap-6">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {user?.image ? (
                                            <Image
                                                src={user.image}
                                                alt="Profile"
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <svg className="w-7 h-7 md:w-9 md:h-9 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        )}
                                    </div>
                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-sm md:text-lg font-bold text-gray-900 truncate">{userName}</h1>
                                        <p className="text-gray-500 text-xs md:text-sm truncate">{user?.email || user?.mobile_number || ""}</p>
                                    </div>
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => { setActiveSection("profile"); setIsEditing(true); }}
                                        className="px-2.5 py-1.5 md:px-4 md:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs md:text-sm font-medium text-gray-700 transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Action Cards Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    {/* Orders Card */}
                                    <button
                                        onClick={() => setActiveSection("orders")}
                                        className="bg-white border rounded-lg p-4 md:p-6 text-center hover:shadow-md transition-shadow group"
                                    >
                                        <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400 group-hover:text-[var(--brand-royal-red)] transition-colors">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">Orders</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500">Check your order status</p>
                                    </button>

                                    {/* Wishlist Card */}
                                    <button
                                        onClick={() => setActiveSection("wishlist")}
                                        className="bg-white border rounded-lg p-4 md:p-6 text-center hover:shadow-md transition-shadow group"
                                    >
                                        <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400 group-hover:text-[var(--brand-royal-red)] transition-colors">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">Wishlist</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500">All your saved products</p>
                                    </button>

                                    {/* Coupons Card */}
                                    <button
                                        onClick={() => setActiveSection("coupons")}
                                        className="bg-white border rounded-lg p-4 md:p-6 text-center hover:shadow-md transition-shadow group"
                                    >
                                        <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400 group-hover:text-[var(--brand-royal-red)] transition-colors">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">Coupons</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500">Your available discounts</p>
                                    </button>

                                    {/* My Points Card */}
                                    <button
                                        onClick={() => setActiveSection("benefits")}
                                        className="bg-white border rounded-lg p-4 md:p-6 text-center hover:shadow-md transition-shadow group"
                                    >
                                        <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400 group-hover:text-[var(--brand-royal-red)] transition-colors">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">My Points</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500">Manage your rewards</p>
                                    </button>

                                    {/* Track Order Card */}
                                    <button
                                        onClick={() => setActiveSection("tracking")}
                                        className="bg-white border rounded-lg p-4 md:p-6 text-center hover:shadow-md transition-shadow group"
                                    >
                                        <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400 group-hover:text-[var(--brand-royal-red)] transition-colors">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">Track Order</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500">Track your shipments</p>
                                    </button>

                                    {/* Profile Card */}
                                    <button
                                        onClick={() => { setActiveSection("profile"); setIsEditing(true); }}
                                        className="bg-white border rounded-lg p-4 md:p-6 text-center hover:shadow-md transition-shadow group"
                                    >
                                        <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400 group-hover:text-[var(--brand-royal-red)] transition-colors">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">Profile</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500">Edit your account</p>
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Orders with Tabs */}
                        {activeSection === "orders" && (
                            <div className="bg-white rounded-xl shadow-sm border">
                                <div className="p-6 border-b">
                                    <h2 className="text-2xl font-bold text-[var(--brand-royal-red)]">My Orders</h2>
                                </div>

                                <div className="border-b overflow-x-auto">
                                    <div className="flex">
                                        {ORDER_TABS.map(tab => {
                                            const IconComponent = tab.Icon;
                                            return (
                                                <button key={tab.id} onClick={() => setActiveOrderTab(tab.id)}
                                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeOrderTab === tab.id ? "border-[var(--brand-royal-red)] text-[var(--brand-royal-red)] bg-red-50/30" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                                                    <IconComponent size={18} />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {ordersLoading ? (
                                        <div className="flex justify-center py-20">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                                        </div>
                                    ) : orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {orders.map(order => (
                                                <div key={order.id} className="border rounded-lg p-6">
                                                    <div className="flex justify-between mb-4">
                                                        <div>
                                                            <p className="font-mono font-bold">{order.invoice_id}</p>
                                                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                                {getStatusLabel(order.status)}
                                                            </span>
                                                            <p className="text-lg font-bold text-[var(--brand-royal-red)] mt-2">৳{order.sub_total || order.total}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600">Items: {order.sales_details?.length || 0} • {order.delivery_customer_address}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-gray-400">
                                            <p className="text-4xl mb-4">📦</p>
                                            <p>No orders found in this category</p>
                                            <p className="text-sm mt-2">Orders will appear here once you make a purchase</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Tracking */}
                        {activeSection === "tracking" && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border">
                                <h2 className="text-2xl font-bold mb-6">Track Your Order</h2>
                                <form onSubmit={handleTrackOrder} className="mb-8">
                                    <div className="flex gap-4">
                                        <input type="text" value={trackInvoiceId} onChange={(e) => setTrackInvoiceId(e.target.value)}
                                            placeholder="Enter Invoice ID" className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--brand-royal-red)] focus:outline-none" />
                                        <button type="submit" disabled={trackLoading}
                                            className="px-6 py-3 bg-[var(--brand-royal-red)] text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
                                            {trackLoading ? "Searching..." : "Track"}
                                        </button>
                                    </div>
                                </form>

                                {trackOrderData && (
                                    <div className="border rounded-lg p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="font-mono font-bold text-lg">{trackOrderData.invoice_id}</p>
                                                <p className="text-sm text-gray-500">{new Date(trackOrderData.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(trackOrderData.status)}`}>
                                                {getStatusLabel(trackOrderData.status)}
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Customer</p>
                                                    <p className="text-sm">{trackOrderData.delivery_customer_name}</p>
                                                    <p className="text-sm">{trackOrderData.delivery_customer_phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                                                    <p className="text-sm">{trackOrderData.delivery_customer_address}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                                <p className="text-2xl font-bold text-[var(--brand-royal-red)]">৳{trackOrderData.total || trackOrderData.sub_total}</p>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h3 className="font-semibold mb-4">Order Items</h3>
                                            <div className="space-y-3">
                                                {trackOrderData.sales_details?.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-gray-100 rounded relative">
                                                            {item.product_info?.image_path && <Image src={item.product_info.image_path} alt={item.product_info.name} fill className="object-cover rounded" unoptimized />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{item.product_info?.name}</p>
                                                            <p className="text-xs text-gray-500">Qty: {item.qty} {item.size && `• Size: ${item.size}`}</p>
                                                        </div>
                                                        <p className="font-medium">৳{item.price * item.qty}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Benefits */}
                        {activeSection === "benefits" && (
                            <div className="space-y-6">
                                {/* Points & Credit Cards */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    {/* Your Points */}
                                    <div className="bg-white rounded-xl shadow-sm border p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-[var(--brand-royal-red)] p-3 rounded-xl">
                                                <svg width="24" height="24" fill="white" stroke="white" strokeWidth="2">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Your Points Now:</p>
                                                <p className="text-3xl font-bold text-gray-900">283,000</p>
                                                <p className="text-xs text-gray-500 mt-1">Equal: 1,504 BDT credit</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shop Now */}
                                    <div className="bg-gradient-to-br from-[var(--brand-royal-red)] to-red-600 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
                                        <div className="bg-white p-3 rounded-xl mb-3">
                                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="9" cy="21" r="1"></circle>
                                                <circle cx="20" cy="21" r="1"></circle>
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                            </svg>
                                        </div>
                                        <Link href="/" className="bg-white text-[var(--brand-royal-red)] px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                                            Shop now
                                        </Link>
                                    </div>

                                    {/* Your Credit */}
                                    <div className="bg-white rounded-xl shadow-sm border p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-blue-600 p-3 rounded-xl">
                                                <svg width="24" height="24" fill="white" stroke="white" strokeWidth="2">
                                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Your Credit Now:</p>
                                                <p className="text-3xl font-bold text-gray-900">৳500</p>
                                                <p className="text-xs text-gray-500 mt-1">📅 Exp in: 30 Dec 2026</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Membership Tier Progress */}
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    <h3 className="font-bold text-lg mb-6">Membership Tier</h3>
                                    <div className="relative">
                                        <div className="flex justify-between items-start mb-4">
                                            {[
                                                { name: "Basic", points: "0", active: true, color: "bg-green-500" },
                                                { name: "Silver", points: "3,000", active: true, color: "bg-green-500" },
                                                { name: "Gold", points: "15,000", active: true, color: "bg-blue-600" },
                                                { name: "VIP", points: "30,000", active: false, color: "bg-gray-300" },
                                            ].map((tier, i) => (
                                                <div key={i} className="flex flex-col items-center flex-1">
                                                    <div className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center mb-2 relative z-10`}>
                                                        {tier.active ? (
                                                            <svg width="24" height="24" fill="white" stroke="white" strokeWidth="2">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        ) : (
                                                            <svg width="24" height="24" fill="white" stroke="white" strokeWidth="2">
                                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <p className="font-semibold text-sm text-gray-900">{tier.name}</p>
                                                    <p className="text-xs text-gray-500">{tier.points} points</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-0">
                                            <div className="h-full bg-blue-600" style={{ width: "66%" }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Featured Coupons */}
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg">Featured Coupons</h3>
                                        <button onClick={() => setActiveSection("coupons")} className="text-sm text-[var(--brand-royal-red)] font-semibold hover:underline">View All</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { name: "Delivery Coupon", discount: "10%", amount: "৳100", badge: "Renewal", expiry: "15 Dec 2025", color: "bg-green-500" },
                                            { name: "Basic Coupon", discount: "75%", amount: "৳750", badge: "New", expiry: "15 Dec 2025", color: "bg-blue-600" },
                                            { name: "Login Coupon", discount: "50%", amount: "৳500", badge: "New", expiry: "15 Dec 2025", color: "bg-indigo-700" },
                                            { name: "Premium Coupon", discount: "50%", amount: "৳500", badge: "Renewal", expiry: "15 Dec 2025", color: "bg-orange-500" },
                                        ].map((coupon, i) => (
                                            <div key={i} className={`${coupon.color} rounded-xl p-4 text-white`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-semibold">{coupon.badge}</span>
                                                    <span className="text-xs opacity-90">Until {coupon.expiry}</span>
                                                </div>
                                                <h4 className="font-bold mb-2">{coupon.name}</h4>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold">{coupon.discount}</span>
                                                    <span className="text-sm opacity-90">{coupon.amount}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* My Points Summary */}
                                <div className="bg-white rounded-xl shadow-sm border">
                                    <details className="group">
                                        <summary className="flex items-center justify-between p-6 cursor-pointer">
                                            <h3 className="font-bold text-lg">My Points Summary</h3>
                                            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </summary>
                                        <div className="px-6 pb-6 space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Points Earned</span>
                                                <span className="font-bold text-gray-900">283,000</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Points Used</span>
                                                <span className="font-bold text-gray-900">0</span>
                                            </div>
                                            <div className="flex justify-between pt-3 border-t">
                                                <span className="font-semibold text-gray-900">Available Balance</span>
                                                <span className="font-bold text-blue-600 text-lg">283,000</span>
                                            </div>
                                        </div>
                                    </details>
                                </div>

                                {/* How to Earn Club Points */}
                                <div className="bg-white rounded-xl shadow-sm border">
                                    <details className="group">
                                        <summary className="flex items-center justify-between p-6 cursor-pointer">
                                            <h3 className="font-bold text-lg">How to Earn Club Points</h3>
                                            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </summary>
                                        <div className="px-6 pb-6 grid md:grid-cols-2 gap-4">
                                            <div className="flex gap-3">
                                                <div className="bg-blue-50 p-3 rounded-lg h-fit">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="9" cy="21" r="1"></circle>
                                                        <circle cx="20" cy="21" r="1"></circle>
                                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 mb-1">Make Purchases</p>
                                                    <p className="text-sm text-gray-600">Earn 1 point per ৳1 spent</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="bg-pink-50 p-3 rounded-lg h-fit">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                        <path d="M9 11l3 3L22 4"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 mb-1">Complete Surveys</p>
                                                    <p className="text-sm text-gray-600">Earn up to 100 points</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="bg-purple-50 p-3 rounded-lg h-fit">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="8.5" cy="7" r="4"></circle>
                                                        <polyline points="17 11 19 13 23 9"></polyline>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 mb-1">Refer Friends</p>
                                                    <p className="text-sm text-gray-600">Get 500 points per referral</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="bg-orange-50 p-3 rounded-lg h-fit">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 mb-1">Special Events</p>
                                                    <p className="text-sm text-gray-600">Bonus points during promotions</p>
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        )}

                        {/* Wishlist */}
                        {activeSection === "wishlist" && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border">
                                <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                                {wishlist.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {wishlist.map((product) => (
                                            <Link key={product.id} href={`/product/${product.slug}`} className="group">
                                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                    <div className="relative aspect-square bg-gray-100">
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div className="p-3">
                                                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm text-gray-900">৳{product.price}</span>
                                                            {product.originalPrice && (
                                                                <span className="text-xs text-gray-400 line-through">৳{product.originalPrice}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-gray-400">
                                        <Heart size={64} className="mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Wishlist is Empty</h3>
                                        <p className="mb-6">Save items you love to your wishlist</p>
                                        <Link href="/" className="inline-block bg-[var(--brand-royal-red)] text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                                            Start Shopping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Coupons */}
                        {activeSection === "coupons" && (
                            <CouponsSection
                                user={user}
                                myCoupons={coupons}
                                myCouponsLoading={couponsLoading}
                            />
                        )}

                        {/* Profile */}
                        {activeSection === "profile" && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Profile Settings</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-[var(--brand-royal-red)] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        {/* Profile Picture Upload */}
                                        <div className="flex items-center gap-6 pb-6 border-b">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                    {profileImagePreview || user?.image ? (
                                                        <Image
                                                            src={profileImagePreview || user.image}
                                                            alt="Profile"
                                                            width={96}
                                                            height={96}
                                                            className="w-full h-full object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                {imageUploading && (
                                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 mb-1">Profile Picture</h3>
                                                <p className="text-sm text-gray-500 mb-3">Upload a new profile picture</p>
                                                <div className="flex gap-2">
                                                    <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setProfileImage(file);
                                                                    setProfileImagePreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                        />
                                                        Choose Image
                                                    </label>
                                                    {(profileImagePreview || user?.image) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setProfileImage(null);
                                                                setProfileImagePreview(null);
                                                            }}
                                                            className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-royal-red)] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-royal-red)] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-royal-red)] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                                <input
                                                    type="tel"
                                                    name="mobile_number"
                                                    value={formData.mobile_number}
                                                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-royal-red)] focus:border-transparent"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                                <textarea
                                                    name="address"
                                                    rows={3}
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-royal-red)] focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4 border-t">
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="px-6 py-2.5 bg-[var(--brand-royal-red)] text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                            >
                                                {isUpdating ? "Saving..." : "Save Changes"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Profile Picture Display */}
                                        <div className="flex items-center gap-4 pb-6 border-b">
                                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                {user?.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt="Profile"
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.name || "User"}</h3>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                                                <p className="text-gray-900">{user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.name || "N/A"}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                                <p className="text-gray-900">{user.email || "N/A"}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                                <p className="text-gray-900">{user.mobile_number || user.phone || "N/A"}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                                                <p className="text-gray-900">{user.address || "No address provided"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Addresses Section */}
                        {activeSection === "addresses" && (
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-2xl font-bold text-[var(--brand-royal-red)] mb-6">My Addresses</h2>
                                <div className="space-y-4">
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Default Address</h3>
                                                <p className="text-gray-600 text-sm">{user?.address || "No address saved"}</p>
                                                <p className="text-gray-600 text-sm mt-1">{user?.mobile_number || user?.phone || ""}</p>
                                            </div>
                                            <button
                                                onClick={() => { setActiveSection("profile"); setIsEditing(true); }}
                                                className="text-[var(--brand-royal-red)] text-sm font-medium hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm">To update your address, please edit your profile.</p>
                                </div>
                            </div>
                        )}

                        {/* Terms of Use Section */}
                        {activeSection === "terms" && (
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-2xl font-bold text-[var(--brand-royal-red)] mb-2">Terms & Conditions</h2>
                                <p className="text-gray-500 mb-6 text-sm">Last updated: January 1, 2026</p>
                                <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">1. Agreement to Terms</h3>
                                        <p className="text-sm">These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Brand Empire ("we," "us" or "our"), concerning your access to and use of the Brand Empire website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.</p>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">2. User Representations</h3>
                                        <p className="text-sm">By using the Site, you represent and warrant that:</p>
                                        <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                                            <li>All registration information you submit will be true, accurate, current, and complete.</li>
                                            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                                            <li>You have the legal capacity and you agree to comply with these Terms of Use.</li>
                                            <li>You are not a minor in the jurisdiction in which you reside.</li>
                                        </ul>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">3. Products</h3>
                                        <p className="text-sm">We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.</p>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">4. Purchases and Payment</h3>
                                        <p className="text-sm">We accept varying forms of payment as indicated on the website. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. Sales tax will be added to the price of purchases as deemed required by us.</p>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">5. Contact Us</h3>
                                        <p className="text-sm">In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:support@brandempire.com" className="text-red-600 hover:underline">support@brandempire.com</a>.</p>
                                    </section>
                                </div>
                            </div>
                        )}

                        {/* Privacy Center Section */}
                        {activeSection === "privacy" && (
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-2xl font-bold text-[var(--brand-royal-red)] mb-2">Privacy Policy</h2>
                                <p className="text-gray-500 mb-6 text-sm">Last updated: January 1, 2026</p>
                                <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">1. Introduction</h3>
                                        <p className="text-sm">Welcome to Brand Empire. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">2. Data We Collect</h3>
                                        <p className="text-sm">We may collect, use, store and transfer different kinds of personal data about you:</p>
                                        <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                            <li><strong>Financial Data:</strong> includes payment card details (processed securely by our third-party payment processors).</li>
                                            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                                        </ul>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">3. How We Use Your Data</h3>
                                        <p className="text-sm">We will only use your personal data when the law allows us to:</p>
                                        <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                            <li>Where it is necessary for our legitimate interests and your interests do not override those interests.</li>
                                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                                        </ul>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">4. Data Security</h3>
                                        <p className="text-sm">We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">5. Contact Details</h3>
                                        <p className="text-sm">If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:privacy@brandempire.com" className="text-red-600 hover:underline">privacy@brandempire.com</a>.</p>
                                    </section>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// CouponsSection Component with All Coupons and My Coupons tabs
function CouponsSection({ user, myCoupons, myCouponsLoading }) {
    const [activeTab, setActiveTab] = useState("all");
    const [allCoupons, setAllCoupons] = useState([]);
    const [allCouponsLoading, setAllCouponsLoading] = useState(true);
    const [collectingId, setCollectingId] = useState(null);
    const [collectedCoupons, setCollectedCoupons] = useState([]); // Track locally collected coupons

    // Fetch all available coupons
    useEffect(() => {
        const fetchAllCoupons = async () => {
            try {
                const data = await getCouponList();
                if (data.success && data.data) {
                    setAllCoupons(Array.isArray(data.data) ? data.data : []);
                }
            } catch (error) {
                console.error("Error fetching coupons:", error);
            } finally {
                setAllCouponsLoading(false);
            }
        };
        fetchAllCoupons();
    }, []);

    // Check if coupon is already collected (from API or locally)
    const isAlreadyCollected = (couponCode) => {
        return myCoupons.some(c => c.coupon_code === couponCode) ||
            collectedCoupons.includes(couponCode);
    };

    // Handle coupon collection
    const handleCollect = async (coupon) => {
        if (!user) {
            toast.error("Please login to collect coupons");
            return;
        }

        setCollectingId(coupon.id);
        try {
            const customerId = user.id || user.customer_id;
            const result = await collectCoupon(coupon.coupon_code, customerId);

            if (result.success) {
                toast.success("Coupon collected successfully!");
                // Add to local collected list instead of page reload
                setCollectedCoupons(prev => [...prev, coupon.coupon_code]);
            } else {
                toast.error(result.message || "Failed to collect coupon");
            }
        } catch (error) {
            console.error("Error collecting coupon:", error);
            toast.error("Something went wrong");
        } finally {
            setCollectingId(null);
        }
    };

    // Filter coupons expiring in 5 days or less
    const expiringSoonCoupons = allCoupons.filter(coupon => {
        const now = new Date();
        const expireDate = new Date(coupon.expire_date);
        const diffTime = expireDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 5;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border">
            {/* Tabs */}
            <div className="border-b overflow-x-auto">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2 ${activeTab === "all"
                            ? "border-[var(--brand-royal-red)] text-[var(--brand-royal-red)]"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        All Coupons
                    </button>
                    <button
                        onClick={() => setActiveTab("expiring")}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2 ${activeTab === "expiring"
                            ? "border-[var(--brand-royal-red)] text-[var(--brand-royal-red)]"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Expires Soon {expiringSoonCoupons.length > 0 && `(${expiringSoonCoupons.length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab("my")}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2 ${activeTab === "my"
                            ? "border-[var(--brand-royal-red)] text-[var(--brand-royal-red)]"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        My Coupons ({myCoupons.length})
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* All Coupons Tab */}
                {activeTab === "all" && (
                    <>
                        {allCouponsLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                            </div>
                        ) : allCoupons.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {allCoupons.map(coupon => {
                                    const collected = isAlreadyCollected(coupon.coupon_code);
                                    const expired = new Date(coupon.expire_date) < new Date();

                                    return (
                                        <div
                                            key={coupon.id}
                                            className={`border rounded-lg p-5 relative overflow-hidden ${collected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            {/* Discount Badge */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="text-2xl font-bold text-[var(--brand-royal-red)]">
                                                        {coupon.coupon_amount_type === 'percentage'
                                                            ? `${parseFloat(coupon.amount)}% OFF`
                                                            : `৳${parseFloat(coupon.amount)} OFF`
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-600 font-medium">{coupon.coupon_name}</p>
                                                </div>
                                                {collected && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
                                                        Collected
                                                    </span>
                                                )}
                                            </div>

                                            {/* Coupon Code */}
                                            <div className="bg-white rounded border border-dashed border-gray-300 px-3 py-2 mb-3">
                                                <p className="font-mono text-sm font-bold text-center text-gray-800">
                                                    {coupon.coupon_code}
                                                </p>
                                            </div>

                                            {/* Details */}
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                                {parseFloat(coupon.minimum_order_amount) > 0 && (
                                                    <span>Min. order: ৳{parseFloat(coupon.minimum_order_amount)}</span>
                                                )}
                                                <span>
                                                    Expires: {new Date(coupon.expire_date).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Collect Button */}
                                            {!collected && !expired && (
                                                <button
                                                    onClick={() => handleCollect(coupon)}
                                                    disabled={collectingId === coupon.id}
                                                    className="w-full py-2.5 bg-[var(--brand-royal-red)] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                                >
                                                    {collectingId === coupon.id ? "Collecting..." : "Collect Coupon"}
                                                </button>
                                            )}
                                            {expired && (
                                                <p className="text-center text-sm text-red-500 font-medium">Expired</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-4xl mb-4">🏷️</p>
                                <p>No coupons available right now</p>
                            </div>
                        )}
                    </>
                )}

                {/* Expires Soon Tab */}
                {activeTab === "expiring" && (
                    <>
                        {allCouponsLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                            </div>
                        ) : expiringSoonCoupons.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {expiringSoonCoupons.map(coupon => {
                                    const collected = isAlreadyCollected(coupon.coupon_code);
                                    const expireDate = new Date(coupon.expire_date);
                                    const diffDays = Math.ceil((expireDate - new Date()) / (1000 * 60 * 60 * 24));

                                    return (
                                        <div
                                            key={coupon.id}
                                            className={`border rounded-lg p-5 relative overflow-hidden ${collected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                                                }`}
                                        >
                                            {/* Urgency Badge */}
                                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-bl font-medium">
                                                ⏰ {diffDays} day{diffDays !== 1 ? 's' : ''} left
                                            </div>

                                            {/* Discount Badge */}
                                            <div className="flex items-start justify-between mb-3 mt-2">
                                                <div>
                                                    <p className="text-2xl font-bold text-[var(--brand-royal-red)]">
                                                        {coupon.coupon_amount_type === 'percentage'
                                                            ? `${parseFloat(coupon.amount)}% OFF`
                                                            : `৳${parseFloat(coupon.amount)} OFF`
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-600 font-medium">{coupon.coupon_name}</p>
                                                </div>
                                                {collected && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
                                                        Collected
                                                    </span>
                                                )}
                                            </div>

                                            {/* Coupon Code */}
                                            <div className="bg-white rounded border border-dashed border-gray-300 px-3 py-2 mb-3">
                                                <p className="font-mono text-sm font-bold text-center text-gray-800">
                                                    {coupon.coupon_code}
                                                </p>
                                            </div>

                                            {/* Details */}
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                                {parseFloat(coupon.minimum_order_amount) > 0 && (
                                                    <span>Min. order: ৳{parseFloat(coupon.minimum_order_amount)}</span>
                                                )}
                                                <span className="text-orange-600 font-medium">
                                                    Expires: {expireDate.toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Collect Button */}
                                            {!collected && (
                                                <button
                                                    onClick={() => handleCollect(coupon)}
                                                    disabled={collectingId === coupon.id}
                                                    className="w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                                                >
                                                    {collectingId === coupon.id ? "Collecting..." : "Collect Before It's Gone!"}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>No coupons expiring soon</p>
                                <p className="text-sm mt-1">Check back later for time-sensitive offers!</p>
                            </div>
                        )}
                    </>
                )}

                {/* My Coupons Tab */}
                {activeTab === "my" && (
                    <>
                        {myCouponsLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                            </div>
                        ) : myCoupons.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {myCoupons.map(coupon => (
                                    <div key={coupon.customer_coupon_id} className="border-2 border-dashed border-[var(--brand-royal-red)] rounded-lg p-5 bg-red-50/30">
                                        <p className="text-2xl font-bold text-[var(--brand-royal-red)] mb-1">৳{coupon.amount} OFF</p>
                                        <p className="text-xs text-gray-600 mb-3">
                                            {parseFloat(coupon.minimum_order_amount) > 0
                                                ? `Min. order: ৳${coupon.minimum_order_amount}`
                                                : 'No minimum order'
                                            }
                                        </p>
                                        <div className="bg-white rounded px-4 py-2 border mb-3">
                                            <p className="font-mono text-sm font-bold text-center">{coupon.coupon_code}</p>
                                        </div>
                                        <p className="text-xs text-gray-600">Expires: {new Date(coupon.expire_date).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-4xl mb-4">🏷️</p>
                                <p className="mb-2">You haven't collected any coupons yet</p>
                                <button
                                    onClick={() => setActiveTab("all")}
                                    className="text-[var(--brand-royal-red)] font-medium hover:underline"
                                >
                                    Browse available coupons
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
