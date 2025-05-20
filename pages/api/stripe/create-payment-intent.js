import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { items, customer_id } = req.body;

    if (!items || !items.length || !customer_id) {
      return res.status(400).json({
        error: "Invalid request",
        details: "Items array and customer_id are required",
      });
    }

    // Group items by vendor
    const itemsByVendor = items.reduce((acc, item) => {
      if (!acc[item.vendor_id]) {
        acc[item.vendor_id] = [];
      }
      acc[item.vendor_id].push(item);
      return acc;
    }, {});

    // Create a payment intent for each vendor
    const paymentIntents = await Promise.all(
      Object.entries(itemsByVendor).map(async ([vendor_id, vendorItems]) => {
        // Calculate total amount for this vendor
        const amount = vendorItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Get vendor's Stripe account
        const { data: stripeAccount, error: stripeError } = await supabase
          .from("stripe_accounts")
          .select("stripe_account_id, charges_enabled")
          .eq("vendor_id", vendor_id)
          .single();

        if (stripeError || !stripeAccount?.charges_enabled) {
          throw new Error(
            `Vendor ${vendor_id} is not properly configured for payments`
          );
        }

        // Create payment intent for this vendor
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "usd",
          application_fee_amount: Math.round(amount * 100 * 0.01),
          transfer_data: {
            destination: stripeAccount.stripe_account_id,
          },
          metadata: {
            vendor_id,
            customer_id,
            items: JSON.stringify(
              vendorItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
              }))
            ),
            owner_fee_percentage: 0.01,
          },
        });

        return {
          vendor_id,
          clientSecret: paymentIntent.client_secret,
          amount: amount,
        };
      })
    );

    return res.status(200).json({
      paymentIntents,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create payment intent",
      details: error.message,
    });
  }
}
