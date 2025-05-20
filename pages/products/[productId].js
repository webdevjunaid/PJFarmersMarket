import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProductPage({ product, vendor }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Show loading state during fallback
  if (router.isFallback) {
    return (
      <div className="min-h-screen grid place-items-center">Loading...</div>
    );
  }

  // Handle case where product wasn't found
  if (!product) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Link
            href="/products"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Add to cart functionality
  const handleAddToCart = async () => {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      router.push("/signin");
      return;
    }

    if (session.user.userType !== "customer") {
      toast.error("Only customers can add items to cart");
      return;
    }

    try {
      setIsAddingToCart(true);

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("customer_id", session.user.id)
        .eq("product_id", product.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is expected if item isn't in cart
        console.error("Error checking cart:", checkError);
        toast.error("Something went wrong. Please try again.");
        return;
      }

      if (existingItem) {
        // Update quantity if item already exists
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) {
          console.error("Error updating cart:", updateError);
          toast.error("Failed to update cart. Please try again.");
          return;
        }
      } else {
        // Add new item to cart
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            customer_id: session.user.id,
            product_id: product.id,
            quantity: 1,
          });

        if (insertError) {
          console.error("Error adding to cart:", insertError);
          toast.error("Failed to add to cart. Please try again.");
          return;
        }
      }

      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`${product.title} | PJ Farmers Market`}</title>
        <meta
          name="description"
          content={product.subtitle || "Product from PJ Farmers Market"}
        />
        <meta
          property="og:title"
          content={`${product.title} | PJ Farmers Market`}
        />
        <meta
          property="og:description"
          content={product.subtitle || "Product from PJ Farmers Market"}
        />
        <meta property="og:thumbnail" content={product.thumbnail} />
        <meta
          name="keywords"
          content={`${product.category}, farmers market, ${vendor.name}, local produce`}
        />
        <meta property="og:type" content="product" />
        <meta property="og:price:amount" content={product.price} />
        <meta property="og:price:currency" content="USD" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50">
        <Navbar />
        <Toaster position="top-center" />

        <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            {/* Product thumbnail */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="aspect-square rounded-xl overflow-hidden bg-white shadow-lg mt-8"
            >
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Product Details */}
            <div className="space-y-8 mt-8">
              <div>
                <Link
                  href={`/vendors/${vendor.slug}`}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  {vendor.name}
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">
                  {product.title}
                </h1>
                <p className="text-2xl font-semibold text-indigo-600 mt-2">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              {/* Enhanced Description Section */}
              <article className="prose prose-indigo max-w-none">
                <h2 className="text-xl font-semibold text-gray-900">
                  About this Product
                </h2>
                {product.subtitle ? (
                  <div className="mt-3 space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      {product.subtitle}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-indigo-100 rounded-full px-3 py-1 text-sm font-medium text-indigo-800">
                        {product.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No description available
                  </p>
                )}
              </article>

              <button
                className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                  isAddingToCart
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500"
                } text-white`}
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  // Fetch all product IDs from the database
  const { data: products, error } = await supabase.from("product").select("id");

  if (error) {
    console.error("Error fetching product IDs:", error);
    return {
      paths: [],
      fallback: true,
    };
  }

  // Generate paths for all products
  const paths = products.map((product) => ({
    params: {
      productId: product.id.toString(),
    },
  }));

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  // Fetch the product from the database
  const { data: product, error: productError } = await supabase
    .from("product")
    .select("*")
    .eq("id", params.productId)
    .single();

  if (productError || !product) {
    return {
      notFound: true,
    };
  }

  // Fetch the vendor associated with the product
  const { data: vendor, error: vendorError } = await supabase
    .from("vendor")
    .select("*")
    .eq("id", product.vendor_id)
    .single();

  if (vendorError || !vendor) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      product,
      vendor: {
        name: vendor.name,
        slug: vendor.handle,
      },
    },
    revalidate: 60, // Revalidate the page every 60 seconds
  };
}
