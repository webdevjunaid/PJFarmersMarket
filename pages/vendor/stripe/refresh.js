import { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export default function StripeRefresh() {
  const router = useRouter();

  useEffect(() => {
    toast.error("Stripe connection was interrupted. Please try again.");
    router.push("/vendorDashboard");
  }, []);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connection interrupted</h1>
        <p>Redirecting you back to try again...</p>
      </div>
    </div>
  );
}
