import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@supabase/supabase-js";
import { FiShoppingCart } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: products, error: productError } = await supabase
        .from("product")
        .select("*");

      if (productError) {
        console.error(productError);
        return { props: { products: [] } };
      }
      const { data: vendors, error: vendorError } = await supabase
        .from("vendor")
        .select("*");

      if (vendorError) {
        console.error(vendorError);
        return { props: { products: [] } };
      }

      const productsWithVendors = products.map((product) => {
        const vendor = vendors.find(
          (vendor) => vendor.id === product.vendor_id
        );
        return {
          ...product,
          vendorName: vendor?.name,
          vendorSlug: vendor?.handle,
        };
      });
      setProducts(productsWithVendors);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleAddToCart = async (product) => {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    const customerId = session.user.id;

    // Check if product already exists in cart
    const { data: existingItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("customer_id", customerId)
      .eq("product_id", product.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking cart:", fetchError);
      toast.error("Failed to add to cart. Please try again.");
      return;
    }

    if (existingItem) {
      // Update quantity if item exists
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Error updating cart:", updateError);
        toast.error("Failed to update cart. Please try again.");
        return;
      }

      toast.success(`Added another ${product.title} to cart!`);
    } else {
      // Add new item to cart
      const { error: insertError } = await supabase.from("cart_items").insert([
        {
          id: Math.random().toString(36).substring(2, 15),
          customer_id: customerId,
          product_id: product.id,
          quantity: 1,
        },
      ]);

      if (insertError) {
        console.error("Error adding to cart:", insertError);
        toast.error("Failed to add to cart. Please try again.");
        return;
      }

      toast.success(`${product.title} added to cart!`);
    }
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <h1 className="text-3xl font-bold text-center text-indigo-500 mt-8 mb-12">
          All Products
        </h1>
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, vendors, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
            <svg
              className="absolute right-3 top-3 h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden">
                  <motion.img
                    src={product.thumbnail}
                    alt={product.title}
                    className="object-cover w-full h-full"
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.4 },
                    }}
                  />
                  <motion.div
                    className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-indigo-600"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#4F46E5",
                      color: "white",
                    }}
                  >
                    ${product.price}
                  </motion.div>
                </div>
              </Link>
              <div className="p-4 flex-grow flex flex-col">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-indigo-600 transition-colors">
                    {product.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">
                  {product.subtitle || product.category}
                </p>
                <div className="mt-auto">
                  <Link
                    href={`/vendors/${product.vendorSlug}`}
                    className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
                  >
                    by {product.vendorName}
                  </Link>
                </div>
                <motion.button
                  onClick={() => handleAddToCart(product)}
                  className="mt-3 flex items-center justify-center w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
