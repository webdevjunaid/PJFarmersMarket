import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;

        // Extract metadata
        const { vendor_id, customer_id, items } = paymentIntent.metadata;

        const parsedItems = JSON.parse(items || "[]");

        // Calculate owner fee (1% of total)
        const ownerFeeAmount = (
          paymentIntent.application_fee_amount / 100
        ).toFixed(2);
        const order_id = uuidv4();

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            id: order_id,
            customer_id,
            vendor_id,
            stripe_payment_intent_id: paymentIntent.id,
            total_amount: (paymentIntent.amount / 100).toFixed(2),
            owner_fee_amount: ownerFeeAmount,
            status: "completed",
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (orderError) {
          throw new Error(`Error creating order: ${orderError.message}`);
        }
        const orderItems = parsedItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: 0,
        }));
        for (const item of orderItems) {
          const { data: product } = await supabase
            .from("product")
            .select("price")
            .eq("id", item.product_id)
            .single();

          if (product) {
            item.unit_price = product.price;
          }
        }

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          throw new Error(`Error creating order items: ${itemsError.message}`);
        }

        // Transfer owner fee to owner's Stripe account
        const ownerStripeAccountId = process.env.OWNER_STRIPE_ACCOUNT_ID;
        try {
          const transfer = await stripe.transfers.create({
            amount: Math.round(ownerFeeAmount * 100), // Convert to cents
            currency: "usd",
            destination: ownerStripeAccountId,
            transfer_group: `order_${order.id}`,
          });
        } catch (transferError) {
          console.error(`Error creating transfer: ${transferError.message}`);
          throw new Error(`Error creating transfer: ${transferError.message}`);
        }
        const { error: cartDeleteError } = await supabase
          .from("cart_items")
          .delete()
          .eq("customer_id", customer_id);

        if (cartDeleteError) {
        }

        break;
      default:
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
