import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductList({
  vendorProducts,
  handleAddToCart,
  session,
}) {
  const [addingProductId, setAddingProductId] = useState(null);

  const handleAddToCartClick = async (product) => {
    try {
      setAddingProductId(product.id);
      await handleAddToCart(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vendorProducts.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <Link href={`/products/${product.id}`}>
              <div className="h-48 overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/products/${product.id}`}>
                <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
                  {product.title}
                </h3>
              </Link>
              <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                {product.subtitle || "No description available"}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-indigo-600 font-bold">
                  ${product.price.toFixed(2)}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCartClick(product);
                  }}
                  disabled={addingProductId === product.id}
                  className={`px-3 py-1 rounded text-sm ${
                    addingProductId === product.id
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white transition-colors`}
                >
                  {addingProductId === product.id ? (
                    <span className="flex items-center">
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
                    </span>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
