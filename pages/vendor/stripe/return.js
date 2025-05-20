"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function StripeReturn() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const updateStripeStatus = async () => {
      if (session?.user?.id) {
        // Add a flag to localStorage to prevent duplicate processing
        const processedKey = `stripe_connect_processed_${session.user.id}`;
        if (localStorage.getItem(processedKey)) {
          router.push("/vendorDashboard");
          return;
        }

        try {
          // Call your API to update the Stripe account status
          const response = await fetch("/api/stripe/update-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ vendor_id: session.user.id }),
          });

          const data = await response.json();

          if (data.success) {
            if (data.charges_enabled && data.payouts_enabled) {
              toast.success("Stripe account connected and fully activated!");
            } else {
              toast(
                "Stripe account connected, but not fully activated yet. You may need to complete additional verification steps in Stripe."
              );
            }
            // Set the flag to prevent duplicate processing
            localStorage.setItem(processedKey, "true");
          } else {
            toast.error("There was an issue updating your Stripe status.");
          }
        } catch (error) {
          console.error("Error updating Stripe status:", error);
          toast.error("There was an issue updating your Stripe status.");
        }
      }

      router.push("/vendorDashboard");
    };

    updateStripeStatus();
  }, [session]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Connecting your Stripe account...
        </h1>
        <p>You will be redirected to your dashboard shortly.</p>
      </div>
    </div>
  );
}
