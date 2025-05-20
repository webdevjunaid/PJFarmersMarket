import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import CheckoutForm from "../components/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push("/signin");
      return;
    }

    const fetchCartItems = async () => {
      const { data: items, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          product:product_id (
            id,
            title,
            price,
            vendor_id
          )
        `
        )
        .eq("customer_id", session.user.id);

      if (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load cart items");
        return;
      }

      const formattedItems = items.map((item) => ({
        id: item.id,
        product_id: item.product.id,
        vendor_id: item.product.vendor_id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
      }));

      setCartItems(formattedItems);
      setLoading(false);
    };

    fetchCartItems();
  }, [session]);

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (cartItems.length === 0 || !session?.user?.id) return;

      try {
        setPaymentError(null);

        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems,
            customer_id: session.user.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || "Failed to create payment intent");
        }

        // Check if we have payment intents and get the first client secret
        if (data.paymentIntents && data.paymentIntents.length > 0) {
          // Use the first payment intent's client secret
          setClientSecret(data.paymentIntents[0].clientSecret);
        } else {
          throw new Error("No payment intents returned from server");
        }
      } catch (error) {
        console.error("Payment initialization error:", error);
        setPaymentError(error.message);
      }
    };

    if (cartItems.length > 0 && session?.user?.id) {
      createPaymentIntent();
    }
  }, [cartItems, session]);

  const handlePaymentSuccess = useCallback(
    async (paymentIntentId) => {
      try {
        setPaymentSuccessful(true);

        // Clear the cart after successful payment
        if (session?.user?.id) {
          const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("customer_id", session.user.id);

          if (error) {
            console.error("Error clearing cart:", error);
          }
        }

        // Redirect to success page or order confirmation
        router.push(`/order-success?payment_intent=${paymentIntentId}`);
      } catch (error) {
        console.error("Error handling payment success:", error);
        toast.error("There was an issue processing your order");
      }
    },
    [session, router]
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <button
            onClick={() => router.push("/products")}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between py-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>
                    $
                    {cartItems
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            {paymentError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                <p className="font-medium">Payment Error</p>
                <p>{paymentError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm bg-red-100 px-3 py-1 rounded hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: "stripe" },
                }}
              >
                <CheckoutForm onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Preparing payment form...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
