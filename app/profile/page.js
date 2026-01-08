"use client";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCustomerOrders, getCustomerCoupons, trackOrder, updateCustomerProfile } from "@/lib/api";
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
    const { user, logout, loading, token } = useAuth();
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
            const data = await updateCustomerProfile(token, formData);
            if (data.success) {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
                // Optionally refresh user data here
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Something went wrong");
        } finally {
            setIsUpdating(false);
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

                <div className="flex gap-6">
                    {/* Sidebar - Hidden on mobile, overlay when opened */}
                    <aside className={`
                        fixed lg:static
                        top-16 lg:top-auto left-0 lg:left-auto bottom-0 lg:bottom-auto
                        w-64
                        bg-white
                        z-50 lg:z-auto
                        transform lg:transform-none transition-transform duration-300
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        lg:block
                        flex-shrink-0
                        overflow-y-auto
                        h-[calc(100vh-4rem)] lg:h-auto
                    `}>
                        <div className="bg-white lg:rounded-xl shadow-sm border lg:sticky lg:top-24 h-full lg:h-auto">
                            {/* Mobile Close Button */}
                            <div className="lg:hidden flex items-center justify-between p-4 border-b">
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

                            <nav className="p-4 space-y-2">
                                <button onClick={() => { setActiveSection("dashboard"); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === "dashboard" ? "bg-red-50 text-[var(--brand-royal-red)] shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
                                    <Home size={20} />
                                    <span>Dashboard</span>
                                </button>

                                <div>
                                    <button onClick={() => setOrdersExpanded(!ordersExpanded)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Package size={20} />
                                            <span>My Orders</span>
                                        </div>
                                        <ChevronDown size={18} className={`transition-transform ${ordersExpanded ? "rotate-180" : ""}`} />
                                    </button>
                                    {ordersExpanded && (
                                        <div className="ml-9 mt-1 space-y-1">
                                            <button onClick={() => { setActiveSection("orders"); setSidebarOpen(false); }}
                                                className={`w-full text-left px-4 py-2 rounded-lg text-sm ${activeSection === "orders" ? "bg-red-50 text-[var(--brand-royal-red)]" : "text-gray-600 hover:bg-gray-50"}`}>
                                                Orders
                                            </button>
                                            <button onClick={() => { setActiveSection("tracking"); setSidebarOpen(false); }}
                                                className={`w-full text-left px-4 py-2 rounded-lg text-sm ${activeSection === "tracking" ? "bg-red-50 text-[var(--brand-royal-red)]" : "text-gray-600 hover:bg-gray-50"}`}>
                                                Order Tracking
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => { setActiveSection("wishlist"); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === "wishlist" ? "bg-red-50 text-[var(--brand-royal-red)] shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
                                    <Heart size={20} />
                                    <span>Wishlist</span>
                                    {wishlist.length > 0 && <span className="ml-auto bg-[var(--brand-royal-red)] text-white text-xs px-2 py-0.5 rounded-full font-semibold">{wishlist.length}</span>}
                                </button>

                                <button onClick={() => { setActiveSection("benefits"); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === "benefits" ? "bg-red-50 text-[var(--brand-royal-red)] shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                    </svg>
                                    <span>My Benefits</span>
                                </button>

                                <button onClick={() => { setActiveSection("coupons"); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === "coupons" ? "bg-red-50 text-[var(--brand-royal-red)] shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
                                    <Tag size={20} />
                                    <span>My Coupons</span>
                                </button>

                                <button onClick={() => { setActiveSection("profile"); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === "profile" ? "bg-red-50 text-[var(--brand-royal-red)] shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}>
                                    <User size={20} />
                                    <span>Profile Settings</span>
                                </button>

                                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all mt-4 border-t pt-6">
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area - Full width on mobile */}
                    <div className="flex-1 w-full lg:w-auto min-w-0">
                        {/* Dashboard */}
                        {activeSection === "dashboard" && (
                            <>
                                <div className="bg-gradient-to-br from-[var(--brand-royal-red)] to-red-600 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 text-white">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Hello, {userName}</h1>
                                    <p className="text-white/90 text-sm">Welcome back to Brand Empire</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    {[
                                        { label: "Track Orders", icon: "📦", action: () => setActiveSection("orders") },
                                        { label: "My Wishlist", icon: "❤️", action: () => setActiveSection("wishlist") },
                                        { label: "Profile Settings", icon: "👤", action: () => setActiveSection("profile") },
                                        { label: "My Coupons", icon: "🏷️", action: () => setActiveSection("coupons") }
                                    ].map((item, i) => (
                                        item.href ? (
                                            <Link key={i} href={item.href} className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md border text-center">
                                                <div className="text-2xl md:text-3xl mb-2">{item.icon}</div>
                                                <p className="text-xs md:text-sm font-medium">{item.label}</p>
                                            </Link>
                                        ) : (
                                            <button key={i} onClick={item.action} className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md border text-center">
                                                <div className="text-2xl md:text-3xl mb-2">{item.icon}</div>
                                                <p className="text-xs md:text-sm font-medium">{item.label}</p>
                                            </button>
                                        )
                                    ))}
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
                            <div className="bg-white rounded-xl shadow-sm p-6 border">
                                <h2 className="text-2xl font-bold mb-6">My Coupons</h2>
                                {couponsLoading ? (
                                    <div className="flex justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-royal-red)]"></div>
                                    </div>
                                ) : coupons.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {coupons.map(coupon => (
                                            <div key={coupon.customer_coupon_id} className="border-2 border-dashed border-[var(--brand-royal-red)] rounded-lg p-6 bg-red-50/30">
                                                <p className="text-2xl font-bold text-[var(--brand-royal-red)] mb-1">৳{coupon.amount} OFF</p>
                                                <p className="text-xs text-gray-600 mb-3">Min. order: ৳{coupon.minimum_order_amount}</p>
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
                                        <p>No coupons available</p>
                                    </div>
                                )}
                            </div>
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
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
