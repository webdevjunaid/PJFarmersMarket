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

    // Get the Stripe account ID from the database
    const { data: stripeAccount, error: fetchError } = await supabase
      .from("stripe_accounts")
      .select("stripe_account_id")
      .eq("vendor_id", vendor_id)
      .single();

    if (fetchError || !stripeAccount) {
      return res.status(404).json({
        success: false,
        message: "Stripe account not found",
      });
    }

    // Retrieve the account details from Stripe
    const account = await stripe.accounts.retrieve(
      stripeAccount.stripe_account_id
    );

    const { error: updateError } = await supabase
      .from("stripe_accounts")
      .update({
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      })
      .eq("stripe_account_id", account.id);

    if (updateError) {
      throw updateError;
    }

    // Return the updated status
    return res.status(200).json({
      success: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });
  } catch (error) {
    console.error("Error updating Stripe account status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Stripe account status",
    });
  }
}
