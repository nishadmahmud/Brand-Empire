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
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                    <span className="font-medium text-sm">Menu</span>
                </button>

                <div className="flex gap-6">
                    {/* Sidebar (visible on desktop, toggleable on mobile) */}
                    <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
                        <div className="bg-white rounded-xl shadow-sm border sticky top-24">
                            <div className="p-6 border-b">
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

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {/* Dashboard */}
                        {activeSection === "dashboard" && (
                            <>
                                <div className="bg-gradient-to-br from-[var(--brand-royal-red)] to-red-600 rounded-2xl p-8 mb-8 text-white">
                                    <h1 className="text-3xl font-bold mb-2">Hello, {userName}</h1>
                                    <p className="text-white/90">Welcome back to Brand Empire</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Track Orders", icon: "📦", action: () => setActiveSection("orders") },
                                        { label: "My Wishlist", icon: "❤️", href: "/wishlist" },
                                        { label: "Customer Service", icon: "🎧", href: "/contact" },
                                        { label: "My Coupons", icon: "🏷️", action: () => setActiveSection("coupons") }
                                    ].map((item, i) => (
                                        item.href ? (
                                            <Link key={i} href={item.href} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border text-center">
                                                <div className="text-3xl mb-2">{item.icon}</div>
                                                <p className="text-sm font-medium">{item.label}</p>
                                            </Link>
                                        ) : (
                                            <button key={i} onClick={item.action} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border text-center">
                                                <div className="text-3xl mb-2">{item.icon}</div>
                                                <p className="text-sm font-medium">{item.label}</p>
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
