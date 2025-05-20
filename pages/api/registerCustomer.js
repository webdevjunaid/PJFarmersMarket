import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { first_name, email, password } = req.body;

  if (!first_name || !email || !password) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "Supabase URL or Service Role Key are missing in environment variables."
    );
    return res.status(500).json({ message: "Supabase configuration error" });
  }

  const supabaseForAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseForAdmin
      .from("customer")
      .insert([
        {
          id: Math.random() * 1000,
          first_name,
          email,
          password: hashedPassword,
          has_account: true,
          metadata: {},
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error during customer registration:", error);
      return res.status(500).json({
        message: "Failed to register customer",
        detail: error.details,
      });
    }

    return res
      .status(201)
      .json({ message: "Customer registered successfully", data: data });
  } catch (error) {
    console.error("Server error during customer registration:", error);
    return res.status(500).json({
      message: "Something went wrong on the server",
      detail: error.message,
      serverError: error.message,
    });
  }
}
