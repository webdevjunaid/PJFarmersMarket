import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { FiCheckCircle, FiShoppingBag } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "../utils/supabaseClient";

export default function OrderSuccess() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!router.query.payment_intent || !session?.user?.id) return;

      try {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select(
            `
            *,
            vendor (
              id,
              name,
              email
            ),
            order_items (
              id,
              quantity,
              unit_price,
              product (
                id,
                title,
                thumbnail,
                price
              )
            )
          `
          )
          .eq("stripe_payment_intent_id", router.query.payment_intent)
          .single();

        if (orderError) throw orderError;
        if (!order) throw new Error("Order not found");

        setOrderDetails(order);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (router.query.payment_intent && session?.user?.id) {
      fetchOrderDetails();
    }
  }, [router.query.payment_intent, session]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <FiCheckCircle className="text-green-500 w-16 h-16" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-600 mb-8">
            Your payment was successful and your order is being processed.
          </p>

          {loading ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : orderDetails ? (
            <div className="text-left border rounded-lg p-4 mb-8">
              <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
              <p className="text-sm text-gray-500 mb-4">
                Order ID: {orderDetails.id}
              </p>

              <div className="space-y-3">
                {orderDetails.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden mr-3">
                        {item.product?.thumbnail ? (
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <FiShoppingBag className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.product?.title}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>${orderDetails.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-yellow-600 mb-8">
              Order details are not available at the moment. You can check your
              orders in your account.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/customerDashboard")}
              variant="outline"
              className="flex items-center"
            >
              <FiShoppingBag className="mr-2" />
              View My Orders
            </Button>
            <Button
              onClick={() => router.push("/products")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
