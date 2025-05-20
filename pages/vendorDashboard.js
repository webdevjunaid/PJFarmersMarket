import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiLogOut,
  FiPlus,
  FiMenu,
  FiX,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiCamera,
  FiPackage,
  FiSettings,
  FiCreditCard,
  FiShoppingBag,
} from "react-icons/fi";
import { useSession, signOut } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: true,
    },
  }
);

export default function VendorDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });
  const router = useRouter();
  const [productInventory, setProductInventory] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [vendorImage, setVendorImage] = useState(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [products, setProducts] = useState([]);
  const [productCategory, setProductCategory] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const categories = [
    "Seafood",
    "Argentine",
    "Sauces",
    "Bread",
    "Produce",
    "Honey",
    "Coffee",
  ];

  const generateHandle = (title) => {
    return title.toLowerCase().replace(/\s+/g, "-");
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchVendorData = async () => {
      if (session?.user?.id) {
        setIsProductsLoading(true);

        const { data: vendorData, error: vendorError } = await supabase
          .from("vendor")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (vendorError) {
          console.error("Error fetching vendor:", vendorError);
          setIsProductsLoading(false);
          return;
        }

        setVendor(vendorData);

        const { data: productsData, error: productsError } = await supabase
          .from("product")
          .select("*")
          .eq("vendor_id", session.user.id);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          setIsProductsLoading(false);
          return;
        }

        setProducts(productsData);
        setIsProductsLoading(false);
      }
    };

    fetchVendorData();
  }, [session]);

  useEffect(() => {
    const checkStripeAccount = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from("stripe_accounts")
          .select("*")
          .eq("vendor_id", session.user.id)
          .single();

        if (!error && data) {
          setStripeConnected(data.charges_enabled);
        }
      }
    };

    checkStripeAccount();
  }, [session]);
  useEffect(() => {
    const fetchOrders = async () => {
      if (session?.user?.id && activeTab === "orders") {
        try {
          const response = await fetch(
            `/api/orders/vendor-orders?vendor_id=${session.user.id}`
          );
          const data = await response.json();
          setOrders(data);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to load orders");
        }
      }
    };

    fetchOrders();
  }, [session, activeTab]);
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (productImage) {
        try {
          const maxSize = 5 * 1024 * 1024;
          if (productImage.size > maxSize) {
            throw new Error("File size too large. Maximum size is 5MB.");
          }

          const fileExt = productImage.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `product-images/${fileName}`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("products")
              .upload(filePath, productImage, {
                cacheControl: "3600",
                contentType: productImage.type,
                upsert: false,
                duplex: "half",
              });

          if (uploadError) {
            console.error("Upload error details:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }
          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(filePath);

          imageUrl = publicUrl;
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error(
            uploadError.message || "Failed to upload image. Please try again."
          );
          setLoading(false);
          return;
        }
      }

      if (editingProductId) {
        const updateData = {
          title: productName,
          description: productDescription,
          price: parseFloat(productPrice),
          category: productCategory,
          inventory_count: parseInt(productInventory) || 0,
        };

        if (imageUrl) {
          updateData.thumbnail = imageUrl;
        }

        const { data: updatedProduct, error: updateError } = await supabase
          .from("product")
          .update(updateData)
          .eq("id", editingProductId)
          .select()
          .single();

        if (updateError) {
          console.error("Product update error:", updateError);
          throw updateError;
        }

        setProducts(
          products.map((p) => (p.id === editingProductId ? updatedProduct : p))
        );
        toast.success("Product updated successfully!");
      } else {
        const productId = `prod_${Math.random().toString(36).substr(2, 24)}`;
        const handle = generateHandle(productName);

        const { data: newProduct, error: insertError } = await supabase
          .from("product")
          .insert([
            {
              id: productId,
              title: productName,
              handle: handle,
              description: productDescription,
              price: parseFloat(productPrice),
              thumbnail: imageUrl,
              vendor_id: session.user.id,
              category: productCategory,
              inventory_count: parseInt(productInventory) || 0,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Product insert error:", insertError);
          throw insertError;
        }

        setProducts([...products, newProduct]);
        toast.success("Product added successfully!");
      }

      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductCategory("");
      setProductImage(null);
      setProductInventory("");
      setEditingProductId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error with product:", error);
      toast.error(error.message || "Failed to process product");
    } finally {
      setLoading(false);
    }
  };

  // First, add this state at the top with your other state variables
  const [productToDeactivate, setProductToDeactivate] = useState(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  // Then modify the handleDeleteProduct function
  const handleDeleteProduct = async (id) => {
    try {
      // First check if the product exists
      const { data: product, error: fetchError } = await supabase
        .from("product")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching product to delete:", fetchError);
        toast.error("Could not find product to delete");
        return;
      }

      // Check if product is referenced in order_items
      const { data: orderItems, error: orderItemsError } = await supabase
        .from("order_items")
        .select("id")
        .eq("product_id", id)
        .limit(1);

      if (orderItemsError) {
        console.error("Error checking order items:", orderItemsError);
        toast.error("Error checking if product can be deleted");
        return;
      }

      // If product is in order_items, show confirmation dialog
      if (orderItems && orderItems.length > 0) {
        setProductToDeactivate(product);
        setShowDeactivateDialog(true);
        return;
      }

      // Check if product is in cart_items
      const { data: cartItems, error: cartItemsError } = await supabase
        .from("cart_items")
        .select("id")
        .eq("product_id", id);

      if (cartItemsError) {
        console.error("Error checking cart items:", cartItemsError);
        toast.error("Error checking cart items");
        return;
      }

      // If product is in cart_items, delete those entries first
      if (cartItems && cartItems.length > 0) {
        const { error: deleteCartError } = await supabase
          .from("cart_items")
          .delete()
          .eq("product_id", id);

        if (deleteCartError) {
          console.error("Error deleting cart items:", deleteCartError);
          toast.error("Failed to remove product from carts");
          return;
        }
      }

      // Now proceed with product deletion
      const { error } = await supabase.from("product").delete().eq("id", id);

      if (error) {
        console.error("Error deleting product:", error);
        toast.error(`Failed to delete product: ${error.message}`);
        return;
      }

      setProducts(products.filter((product) => product.id !== id));
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  // Add this new function to handle making a product out of stock
  const handleDeactivateProduct = async () => {
    if (!productToDeactivate) return;

    try {
      // Update the product to set inventory to 0
      const { error: updateError } = await supabase
        .from("product")
        .update({ inventory_count: 0 })
        .eq("id", productToDeactivate.id);

      if (updateError) {
        console.error("Error updating product:", updateError);
        toast.error("Failed to update product inventory");
        return;
      }

      // Update local state
      setProducts(
        products.map((p) =>
          p.id === productToDeactivate.id ? { ...p, inventory_count: 0 } : p
        )
      );

      toast.success("Product marked as out of stock");
      setShowDeactivateDialog(false);
      setProductToDeactivate(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleEditProduct = async (product) => {
    if (product && product.id) {
      setEditingProductId(product.id);
      setProductName(product.title || "");
      setProductDescription(product.description || "");
      setProductPrice((product.price || 0).toString());
      setProductCategory(product.category || "");
      setProductImage(null);
      setIsModalOpen(true);
    } else {
      toast.error("Cannot edit product: Invalid product data");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingProfile(true);
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File size too large. Maximum size is 5MB.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `vendor-images/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("vendors")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("vendors").getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from("vendor")
        .update({ logo: publicUrl })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      setVendor({ ...vendor, logo: publicUrl });
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setIsUploadingProfile(false);
    }
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

  const handleStripeConnect = async () => {
    try {
      setIsConnecting(true);
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor_id: session.user.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error connecting to Stripe:", error);
      toast.error("Failed to connect Stripe account");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed z-20 left-0 top-0 h-full bg-card border-r shadow-lg transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20",
          "md:left-4 md:top-4 md:bottom-4 md:h-auto md:rounded-xl overflow-hidden flex flex-col"
        )}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && (
            <h2 className="font-bold text-lg">Vendor Portal</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </Button>
        </div>

        <Separator />

        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <Avatar className="h-10 w-10">
                <AvatarImage src={vendor?.logo} alt={vendor?.name} />
                <AvatarFallback>
                  <FiUser size={20} />
                </AvatarFallback>
              </Avatar>

              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                  disabled={isUploadingProfile}
                />
                {isUploadingProfile ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                ) : (
                  <FiCamera size={16} className="text-white" />
                )}
              </label>
            </div>
            {isSidebarOpen && (
              <div>
                <p className="font-semibold">{vendor?.name || "Loading..."}</p>
                <p className="text-sm text-muted-foreground">{vendor?.email}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="p-4 flex-1">
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("products")}
              className={cn(
                "w-full justify-start",
                isSidebarOpen ? "px-2" : "px-0 justify-center",
                activeTab === "products" && "bg-accent"
              )}
            >
              <FiPackage
                size={20}
                className={cn(isSidebarOpen ? "mr-2" : "")}
              />
              {isSidebarOpen && <span>Products</span>}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("orders")}
              className={cn(
                "w-full justify-start",
                isSidebarOpen ? "px-2" : "px-0 justify-center",
                activeTab === "orders" && "bg-accent"
              )}
            >
              <FiCreditCard
                size={20}
                className={cn(isSidebarOpen ? "mr-2" : "")}
              />
              {isSidebarOpen && <span>Orders</span>}
            </Button>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "w-full",
                isSidebarOpen ? "" : "justify-center px-0"
              )}
            >
              <FiPlus size={20} className={isSidebarOpen ? "mr-2" : ""} />
              {isSidebarOpen && <span>Add Product</span>}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="p-4">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-foreground",
              isSidebarOpen ? "px-2" : "px-0 justify-center"
            )}
          >
            <FiLogOut size={20} className={cn(isSidebarOpen ? "mr-2" : "")} />
            {isSidebarOpen && <span>Sign Out</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 p-6 transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-20",
          "md:p-8"
        )}
      >
        <Toaster />
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Vendor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory and listings
          </p>
        </div>

        {!stripeConnected && (
          <Card className="mb-8 bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-amber-800">
                    Set up payments to receive orders
                  </h3>
                  <p className="text-amber-700 mt-1">
                    Connect your Stripe account to start receiving payments from
                    customers
                  </p>
                </div>
                <Button
                  onClick={handleStripeConnect}
                  disabled={isConnecting}
                  className={cn(
                    isConnecting && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isConnecting ? "Connecting..." : "Connect Stripe"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "products" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Products</h2>
              <Button onClick={() => setIsModalOpen(true)}>
                <FiPlus className="mr-2" /> Add Product
              </Button>
            </div>

            {isProductsLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <FiPackage size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">
                  No products yet
                </h3>
                <p className="text-gray-500 mt-2">
                  Add your first product to start selling
                </p>
                <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                  Add Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                              {product.thumbnail ? (
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <FiCamera
                                    size={16}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200"
                          >
                            {product.category || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {product.inventory_count > 0 ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              In stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              Out of stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <FiEdit2 size={14} className="mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <FiTrash2 size={14} className="mr-1" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold">Your Orders</h2>
            <Separator />
            <div className="mt-4">
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">
                              Order #{order.id.substring(0, 8)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}{" "}
                              - Customer:{" "}
                              {order.customer?.first_name || "Unknown"}
                            </p>
                            <Badge
                              className={cn(
                                "mt-2",
                                order.status === "completed" &&
                                  "bg-green-100 text-green-800",
                                order.status === "pending" &&
                                  "bg-yellow-100 text-yellow-800",
                                order.status === "cancelled" &&
                                  "bg-red-100 text-red-800"
                              )}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                            <p className="font-medium text-lg mt-2">
                              ${order.total_amount.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2">
                          <h4 className="font-medium">Order Items</h4>
                          {order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                {item.product?.thumbnail && (
                                  <img
                                    src={item.product.thumbnail}
                                    alt={item.product?.title}
                                    className="w-10 h-10 object-cover rounded mr-3"
                                  />
                                )}
                                <span>
                                  {item.product?.title || "Unknown Product"}
                                </span>
                              </div>
                              <div className="text-right">
                                <p>
                                  {item.quantity} × $
                                  {item.unit_price.toFixed(2)}
                                </p>
                                <p className="font-medium">
                                  $
                                  {(item.quantity * item.unit_price).toFixed(2)}
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
                <div className="text-center py-8">
                  <FiShoppingBag
                    size={40}
                    className="mx-auto text-muted-foreground mb-2"
                  />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingProductId ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">
                    Product Name (Should be Unique)
                  </Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productCategory">Category</Label>
                  <Select
                    value={productCategory}
                    onValueChange={setProductCategory}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="productDescription">
                    Product Description
                  </Label>
                  <Textarea
                    id="productDescription"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productPrice">Product Price (USD)</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productImage">Product Image</Label>
                  <Input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div>
                  <Label htmlFor="productInventory">Inventory Count</Label>
                  <Input
                    id="productInventory"
                    type="number"
                    min="0"
                    value={productInventory}
                    onChange={(e) => setProductInventory(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProductId(null);
                    setProductName("");
                    setProductDescription("");
                    setProductPrice("");
                    setProductCategory("");
                    setProductImage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? editingProductId
                      ? "Updating..."
                      : "Adding..."
                    : editingProductId
                    ? "Update Product"
                    : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Deactivate Product Dialog */}
        <Dialog
          open={showDeactivateDialog}
          onOpenChange={setShowDeactivateDialog}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cannot Delete Product</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                This product cannot be deleted because it has existing orders.
                Would you like to mark it as out of stock instead?
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeactivateDialog(false);
                  setProductToDeactivate(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleDeactivateProduct}>
                Mark as Out of Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
