import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { vendor_id } = req.body;

    // Check if vendor already has a Stripe account
    const { data: existingAccount } = await supabase
      .from("stripe_accounts")
      .select("stripe_account_id")
      .eq("vendor_id", vendor_id)
      .single();

    let accountId;

    if (existingAccount) {
      accountId = existingAccount.stripe_account_id;
    } else {
      // Create Stripe Connect account
      // Update the account creation part to explicitly request the transfers capability
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
      });

      accountId = account.id;

      // Save Stripe account details to database
      const { error } = await supabase.from("stripe_accounts").insert({
        vendor_id,
        stripe_account_id: account.id,
      });

      if (error) throw error;
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/stripe/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/stripe/return`,
      type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    res.status(500).json({ message: "Error creating Stripe account" });
  }
}
