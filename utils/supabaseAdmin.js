import { createClient } from "@supabase/supabase-js";

const supabaseAdminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabaseAdminClient;
