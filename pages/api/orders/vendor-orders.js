import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { vendor_id } = req.query;

    if (!vendor_id) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    // Fetch orders for this vendor
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        status,
        total_amount,
        platform_fee,
        customer_id,
        stripe_payment_intent_id,
        customer:customer!customer_id (
          id,
          company_name,
          first_name,
          last_name,
          email,
          phone,
          has_account,
          metadata,
          created_at,
          updated_at,
          deleted_at
        ),
        order_items:order_items!order_id (
          id,
          product_id,
          quantity,
          unit_price,
          stripe_transfer_id,
          created_at,
          price,
          product:product!product_id (
            id,
            title,
            handle,
            subtitle,
            description,
            is_giftcard,
            status,
            thumbnail,
            weight,
            length,
            height,
            mid_code,
            material,
            collection_id,
            type_id,
            discountable,
            external_id,
            created_at,
            updated_at,
            deleted_at,
            metadata,
            vendor_id,
            category,
            price,
            inventory_count
          )
        )
      `
      )
      .eq("vendor_id", vendor_id)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    // Get customer information for each order (This part is likely redundant now, as customer info is already embedded)
    /*
    const customerIds = [...new Set(orders.map((order) => order.customer_id))];

    const { data: customers, error: customersError } = await supabase
      .from("customer")
      .select("id, company_name, first_name, last_name, email, phone, has_account, metadata, created_at, updated_at, deleted_at") // Changed "name" to "first_name"
      .in("id", customerIds);

    if (customersError) throw customersError;

    // Map customer info to orders (Redundant now)
    const customersMap = {};
    customers.forEach((customer) => {
      customersMap[customer.id] = customer;
    });
    */

    const ordersWithEmbeddedInfo = orders.map((order) => ({
      ...order,
      customer: order.customer, // Access the embedded customer data directly
      order_items: order.order_items, // Access embedded order items
    }));
    res.status(200).json(ordersWithEmbeddedInfo);
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ message: error.message });
  }
}
