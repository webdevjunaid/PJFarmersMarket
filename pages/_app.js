import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const inter = Inter({
  subsets: ["latin"],
  weight: "400",
});

export default function App({ Component, pageProps }) {
  const clientSecret = pageProps.clientSecret;

  return (
    <SessionProvider session={pageProps.session}>
      <main className={inter.className}>
        <Toaster />
        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: "stripe" },
            }}
          >
            <Component {...pageProps} />
          </Elements>
        ) : (
          <Component {...pageProps} />
        )}
      </main>
    </SessionProvider>
  );
}
