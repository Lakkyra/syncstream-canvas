import { createClient, SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// Lazy-init: same hoisting issue as upload.ts.
// ES imports are evaluated before dotenv.config() runs in server.ts.
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials in .env");
    }

    console.log("[supabase] Initializing client for:", supabaseUrl);
    _supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        transport: WebSocket
      }
    });
  }
  return _supabase;
}

// Keep backward compat: re-export as `supabase` getter property
// so `import { supabase } from "../supabase"` still works
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  }
});
