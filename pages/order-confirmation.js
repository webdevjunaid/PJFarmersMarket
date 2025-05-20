import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { toast } from "react-hot-toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const { payment_intent, payment_intent_client_secret, redirect_status } =
    router.query;

  useEffect(() => {
    if (payment_intent && session && redirect_status === "succeeded") {
      const fetchOrder = async () => {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select(
              `
              *,
              order_items (
                *,
                product:product_id (
                  title,
                  price,
                  thumbnail
                )
              )
            `
            )
            .eq("stripe_payment_intent_id", payment_intent)
            .single();

          if (error) throw error;

          setOrder(data);

          // Clear cart after successful payment
          const { error: cartError } = await supabase
            .from("cart_items")
            .delete()
            .eq("customer_id", session.user.id);

          if (cartError) {
            console.error("Error clearing cart:", cartError);
          }

          toast.success("Payment successful! Thank you for your order.");
        } catch (error) {
          console.error("Error fetching order:", error);
          toast.error("Error loading order details");
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [payment_intent, session, redirect_status]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mt-2">Thank you for your purchase</p>
          </div>

          {order && (
            <>
              <div className="border-t border-b border-gray-200 py-4 my-6">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono text-gray-900">{order.id}</p>
              </div>

              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    {item.product.thumbnail && (
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.title}</h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × $
                        {item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </p>
                  </div>
                ))}

                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push("/products")}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
