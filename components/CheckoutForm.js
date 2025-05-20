import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import { Button } from "./ui/button";

export default function CheckoutForm({ onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/order-success",
      },
      redirect: "if_required",
    });

    if (result.error) {
      setErrorMessage(
        result.error.message || "Something went wrong with your payment"
      );
      setIsLoading(false);
    } else if (
      result.paymentIntent &&
      result.paymentIntent.status === "succeeded"
    ) {
      setSucceeded(true);
      setIsLoading(false);

      // Call the success handler with the payment intent ID
      if (onPaymentSuccess) {
        onPaymentSuccess(result.paymentIntent.id);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <PaymentElement />

      {errorMessage && (
        <div className="text-red-500 mt-4 text-sm">{errorMessage}</div>
      )}

      <Button
        type="submit"
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
        disabled={isLoading || !stripe || !elements}
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}
