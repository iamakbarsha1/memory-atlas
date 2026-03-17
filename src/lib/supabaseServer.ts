import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseServerConfigured =
  Boolean(supabaseUrl) &&
  !supabaseUrl.includes("your-project-url") &&
  Boolean(supabaseServiceRoleKey) &&
  !supabaseServiceRoleKey.includes("your-service-role-key");

export function createSupabaseServerClient() {
  if (!isSupabaseServerConfigured) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
