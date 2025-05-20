"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import {
  FiHome,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiUser,
  FiMail,
  FiEdit,
  FiCreditCard,
  FiMapPin,
  FiCalendar,
  FiTrash2,
  FiCamera,
  FiPlus,
  FiMinus,
  FiPackage,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CustomerDashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSetting, setActiveSetting] = useState("profile");
  const [showSettings, setShowSettings] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (session?.user?.id) {
        try {
          setIsOrdersLoading(true);
          const { data: ordersData, error } = await supabase
            .from("orders")
            .select(
              `
              *,
              vendor:vendor_id  ( 
                id,
                name,
                email
              ),
              order_items!order_items_order_id_fkey (
                id,
                quantity,
                unit_price,
                product!fk_order_items_product_id(
                  id,
                  title,
                  thumbnail,
                  price
                )
              )
            `
            )
            .eq("customer_id", session.user.id)
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          setOrders(ordersData || []);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to load orders");
        } finally {
          setIsOrdersLoading(false);
        }
      }
    };

    if (session) {
      fetchOrders();
    }
  }, [session]);

  const navItems = [
    { name: "Overview", icon: FiHome, tab: "overview" },
    { name: "Orders", icon: FiShoppingBag, tab: "orders" },
    { name: "Cart", icon: FiShoppingCart, tab: "cart" },
    { name: "Settings", icon: FiSettings, tab: "settings" },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCustomerData();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCartItems();
    }
  }, [session]);
  useEffect(() => {
    if (customerData) {
      setFormData({
        first_name: customerData.first_name || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
      });
    }
  }, [customerData]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const calculateCartItemCount = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const fetchCartItems = async () => {
    setIsCartLoading(true);

    if (!session) {
      toast.error("Please sign in to view your cart");
      setIsCartLoading(false);
      return;
    }

    const { data: cartData, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        product:product_id (
          id,
          title,
          price,
          thumbnail,
          vendor_id
        )
      `
      )
      .eq("customer_id", session.user.id);

    if (cartError) {
      console.error("Error fetching cart:", cartError);
      toast.error("Failed to load cart items");
      setIsCartLoading(false);
      return;
    }

    const { data: vendors, error: vendorError } = await supabase
      .from("vendor")
      .select("*");

    if (vendorError) {
      console.error("Error fetching vendors:", vendorError);
    }

    const formattedCartItems = cartData.map((item) => {
      const vendor = vendors?.find((v) => v.id === item.product.vendor_id);
      return {
        id: item.id,
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        thumbnail: item.product.thumbnail || "https://via.placeholder.com/150",
        quantity: item.quantity,
        vendorName: vendor?.name || "Unknown Vendor",
      };
    });

    setCartItems(formattedCartItems);
    setCartItemCount(calculateCartItemCount(formattedCartItems));
    calculateTotal(formattedCartItems);
    setIsCartLoading(false);
  };
  const calculateTotal = (items) => {
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setCartTotal(subtotal);
  };

  const updateCartItemQuantity = async (item, newQuantity) => {
    console.log("Cart Items before update:", cartItems);
    if (newQuantity < 1) return;

    if (!session) {
      toast.error("Please sign in to update your cart");
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", item.id);
    console.log("New Quantity", newQuantity);
    if (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
      return;
    }

    // Update UI
    const updatedItems = cartItems.map((cartItem) => {
      return cartItem.id === item.id
        ? { ...cartItem, quantity: newQuantity }
        : cartItem;
    });

    setCartItems(updatedItems);
    setCartItemCount(calculateCartItemCount(updatedItems));
    calculateTotal(updatedItems);
    toast.success("Cart updated");
  };

  const removeCartItem = async (item) => {
    if (!session) {
      toast.error("Please sign in to remove items from cart");
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
      return;
    }

    // Update UI
    const updatedItems = cartItems.filter(
      (cartItem) => cartItem.id !== item.id
    );
    setCartItems(updatedItems);
    setCartItemCount(calculateCartItemCount(updatedItems));
    calculateTotal(updatedItems);
    toast.success(`Item removed from cart`);
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const fetchCustomerData = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: customer, error } = await supabase
        .from("customer")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching customer:", error);
        toast.error("Failed to load customer data");
        return;
      }

      setCustomerData(customer);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const removeFromCart = (itemId) => {
    try {
      // Get current cart from localStorage
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Filter out the item to remove
      const updatedCart = currentCart.filter((item) => item.id !== itemId);

      // Save updated cart back to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Update state to reflect changes - use setCartItems instead of setCart
      setCartItems(updatedCart);
      setCartItemCount(calculateCartItemCount(updatedCart));
      calculateTotal(updatedCart);

      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  // Function to handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    try {
      setUploadingAvatar(true);

      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}_${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;
      const filePath = `customer_avatars/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("customers")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("customers").getPublicUrl(filePath);

      // Update customer record with new avatar URL
      const { error: updateError } = await supabase
        .from("customer")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setCustomerData((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("customer")
        .update({
          first_name: formData.first_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      // Update local state
      setCustomerData((prev) => ({
        ...prev,
        ...formData,
      }));

      toast.success("Profile updated successfully");
      setIsEditing(false);

      // Redirect to overview tab and hide settings
      setActiveTab("overview");
      setShowSettings(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50">
      <Navbar />
      <Toaster position="top-center" />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-64 bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6 flex flex-col items-center border-b">
              <div className="relative">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage
                    src={customerData?.avatar_url}
                    alt={customerData?.first_name || "User"}
                  />
                  <AvatarFallback className="bg-indigo-500 text-white text-xl">
                    {customerData?.first_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <label
                  className="absolute bottom-4 right-0 p-1 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50"
                  htmlFor="avatar-upload"
                >
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                  ) : (
                    <FiCamera className="h-4 w-4 text-gray-600" />
                  )}
                </label>
              </div>
              <h3 className="text-lg font-semibold">
                {isLoading ? (
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  customerData?.first_name || "Loading..."
                )}
              </h3>
              <p className="text-sm text-gray-500">
                {isLoading ? (
                  <div className="h-4 w-40 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  customerData?.email || "No email"
                )}
              </p>
              <Badge
                variant="outline"
                className="mt-2 bg-indigo-50 text-indigo-700"
              >
                Customer
              </Badge>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.tab}>
                    <Button
                      variant={activeTab === item.tab ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeTab === item.tab
                          ? "bg-indigo-500 text-white"
                          : "text-gray-600"
                      }`}
                      onClick={() => {
                        setActiveTab(item.tab);
                        if (item.tab === "settings") {
                          setShowSettings(true);
                        } else {
                          setShowSettings(false);
                        }
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </li>
                ))}
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </li>
              </ul>
            </nav>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            {showSettings ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold">
                        Profile Information
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Update your personal information
                      </p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="flex items-start gap-8">
                        {/* Avatar Section */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <Avatar className="h-24 w-24">
                              <AvatarImage
                                src={customerData?.avatar_url}
                                alt={customerData?.first_name || "User"}
                              />
                              <AvatarFallback className="bg-indigo-500 text-white text-xl">
                                {customerData?.first_name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <label
                              className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow cursor-pointer hover:bg-gray-50"
                              htmlFor="avatar-upload"
                            >
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploadingAvatar}
                              />
                              {uploadingAvatar ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                              ) : (
                                <FiCamera className="h-4 w-4 text-gray-600" />
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>

                            {/* Phone Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>

                            {/* Address */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                              </label>
                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-4 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              first_name: customerData?.first_name || "",
                              email: customerData?.email || "",
                              phone: customerData?.phone || "",
                              address: customerData?.address || "",
                            });
                            setIsEditing(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h2 className="text-2xl font-bold mb-6">
                        Dashboard Overview
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                              Total Orders
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {orders.length}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                              Cart Items
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">
                              {cartItemCount}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Recent Orders</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("orders")}
                        >
                          View All
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-gray-500 text-sm">
                              <th className="pb-3 font-medium">Order ID</th>
                              <th className="pb-3 font-medium">Date</th>
                              <th className="pb-3 font-medium">Status</th>
                              <th className="pb-3 font-medium">Items</th>
                              <th className="pb-3 font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isOrdersLoading ? (
                              <tr>
                                <td colSpan="5" className="py-4 text-center">
                                  <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                                  </div>
                                </td>
                              </tr>
                            ) : orders.length > 0 ? (
                              orders.slice(0, 3).map((order) => (
                                <tr
                                  key={order.id}
                                  className="border-t border-gray-100"
                                >
                                  <td className="py-3 font-medium">
                                    {order.id.substring(0, 8)}
                                  </td>
                                  <td className="py-3 text-gray-500">
                                    {new Date(
                                      order.created_at
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="py-3">
                                    <Badge
                                      className={cn(
                                        "capitalize",
                                        order.status === "completed" &&
                                          "bg-green-50 text-green-700 border-green-200",
                                        order.status === "pending" &&
                                          "bg-amber-50 text-amber-700 border-amber-200",
                                        order.status === "cancelled" &&
                                          "bg-red-50 text-red-700 border-red-200"
                                      )}
                                    >
                                      {order.status}
                                    </Badge>
                                  </td>
                                  <td className="py-3 text-gray-500">
                                    {order.order_items
                                      ? order.order_items.length
                                      : 0}
                                  </td>
                                  <td className="py-3 font-medium">
                                    ${order.total_amount.toFixed(2)}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="py-4 text-center text-gray-500"
                                >
                                  No orders found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6">Your Orders</h2>

                    {isOrdersLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <Card
                            key={order.id}
                            className="overflow-hidden border border-gray-200"
                          >
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Order placed on{" "}
                                    {new Date(
                                      order.created_at
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Order ID: {order.id}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    className={cn(
                                      "capitalize",
                                      order.status === "completed" &&
                                        "bg-green-100 text-green-800 border-green-200",
                                      order.status === "pending" &&
                                        "bg-yellow-100 text-yellow-800 border-yellow-200",
                                      order.status === "cancelled" &&
                                        "bg-red-100 text-red-800 border-red-200"
                                    )}
                                  >
                                    {order.status}
                                  </Badge>
                                  <p className="font-semibold">
                                    Total: ${order.total_amount.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="mb-2">
                                <p className="font-medium text-gray-700">
                                  Vendor:{" "}
                                  {order.vendor?.business_name ||
                                    order.vendor?.name ||
                                    "Unknown Vendor"}
                                </p>
                              </div>
                              <div className="space-y-3 mt-4">
                                {order.order_items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between border-b border-gray-100 pb-3"
                                  >
                                    <div className="flex items-center space-x-3">
                                      {item.product?.thumbnail ? (
                                        <img
                                          src={item.product.thumbnail}
                                          alt={item.product?.title}
                                          className="h-12 w-12 rounded-md object-cover"
                                        />
                                      ) : (
                                        <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                                          <FiPackage className="text-gray-400" />
                                        </div>
                                      )}
                                      <span className="font-medium">
                                        {item.product?.title ||
                                          "Unknown Product"}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-600">
                                        {item.quantity} × $
                                        {item.unit_price.toFixed(2)}
                                      </p>
                                      <p className="font-medium">
                                        $
                                        {(
                                          item.quantity * item.unit_price
                                        ).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <FiShoppingBag
                          size={48}
                          className="mx-auto text-gray-400 mb-4"
                        />
                        <h3 className="text-xl font-medium text-gray-700">
                          No orders yet
                        </h3>
                        <p className="text-gray-500 mt-2">
                          When you place orders, they will appear here
                        </p>
                        <Button
                          onClick={() => router.push("/vendors")}
                          className="mt-4"
                        >
                          Browse Vendors
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "cart" && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Your Cart</h2>
                      {cartItems.length > 0 && (
                        <Button
                          onClick={() => router.push("/checkout")}
                          className="bg-indigo-500 hover:bg-indigo-600"
                        >
                          Proceed to Checkout
                        </Button>
                      )}
                    </div>

                    {isCartLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : cartItems.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <FiShoppingBag
                          size={48}
                          className="mx-auto text-gray-400 mb-4"
                        />
                        <h3 className="text-xl font-medium text-gray-700">
                          Your cart is empty
                        </h3>
                        <p className="text-gray-500 mt-2">
                          Add some products to your cart to see them here.
                        </p>
                        <Button
                          onClick={() => router.push("/products")}
                          className="mt-4 bg-indigo-500 hover:bg-indigo-600"
                        >
                          Browse Products
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="space-y-4 mb-6">
                          {cartItems.map((item) => (
                            <div
                              key={item.id || item.productId}
                              className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium">{item.title}</h3>
                                  <p className="text-sm text-gray-500">
                                    ${item.price.toFixed(2)} each
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() =>
                                      updateCartItemQuantity(
                                        item,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                  >
                                    -
                                  </Button>
                                  <span className="w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() =>
                                      updateCartItemQuantity(
                                        item,
                                        item.quantity + 1
                                      )
                                    }
                                  >
                                    +
                                  </Button>
                                </div>
                                <div className="text-right min-w-[80px]">
                                  <p className="font-medium">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                                  onClick={() => removeCartItem(item)}
                                >
                                  <FiTrash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">
                              $
                              {cartItems
                                .reduce(
                                  (total, item) =>
                                    total + item.price * item.quantity,
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                          <Button
                            onClick={() => router.push("/checkout")}
                            className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600"
                          >
                            Proceed to Checkout
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
