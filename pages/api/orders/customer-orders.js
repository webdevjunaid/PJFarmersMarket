import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { customer_id } = req.query;

  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    // First get the orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, customer:customer_id(*)")
      .eq("customer_id", customer_id)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw ordersError;
    }

    // For each order, get the order items and related products
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select("*, product:product_id(*)")
          .eq("order_id", order.id);

        if (itemsError) {
          console.error("Error fetching order items:", itemsError);
          throw itemsError;
        }

        // For each order item, get the vendor information
        const orderItemsWithVendor = await Promise.all(
          orderItems.map(async (item) => {
            if (item.product && item.product.vendor_id) {
              const { data: vendor, error: vendorError } = await supabase
                .from("vendor")
                .select("id, name") // Use 'name' instead of 'business_name'
                .eq("id", item.product.vendor_id)
                .single();

              if (vendorError) {
                console.error("Error fetching vendor:", vendorError);
                // Don't throw, just return the item without vendor
                return item;
              }

              return {
                ...item,
                vendor: vendor,
              };
            }
            return item;
          })
        );

        return {
          ...order,
          order_items: orderItemsWithVendor,
        };
      })
    );

    return res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({ message: "Failed to fetch orders", error });
  }
}
