import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function VendorPage({ vendor }) {
  const [products, setProducts] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchVendorProducts = async () => {
      const { data: vendorProducts, error: productError } = await supabase
        .from("product")
        .select("*")
        .eq("vendor_id", vendor.id);

      if (productError) {
        console.error("Error fetching products:", productError);
        return;
      }

      setProducts(vendorProducts);
    };

    if (vendor) {
      fetchVendorProducts();
    }
  }, [vendor]);
  const handleAddToCart = async (product) => {
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
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("customer_id", session.user.id)
        .eq("product_id", product.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
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
        const cartItemId = `cart_${Math.random()
          .toString(36)
          .substr(2, 9)}_${Date.now()}`;
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            id: cartItemId,
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
    }
  };

  return (
    <main>
      <Navbar />
      <Toaster position="top-center" />
      <div className="mt-20">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600">{vendor?.name}</h1>
          <p className="mt-4 text-xl text-gray-600">{vendor?.description}</p>
        </section>

        {/* List of Products for the Vendor */}
        <ProductList
          vendorProducts={products}
          handleAddToCart={handleAddToCart}
          session={session}
        />
      </div>
    </main>
  );
}

export async function getStaticPaths() {
  const { data: vendors, error } = await supabase
    .from("vendor")
    .select("handle");

  if (error) {
    console.error("Error fetching vendors:", error);
    return { paths: [], fallback: false };
  }

  const paths = vendors.map((vendor) => ({
    params: { handle: vendor.handle },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { data: vendor, error } = await supabase
    .from("vendor")
    .select("*")
    .eq("handle", params.handle)
    .single();

  if (error || !vendor) {
    console.error("Error fetching vendor:", error);
    return { notFound: true };
  }

  return {
    props: {
      vendor,
    },
  };
}
